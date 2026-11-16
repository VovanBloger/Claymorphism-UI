import { CLAY_LAYERS, type ClayLayerId } from './clayLayers';

export type ClayReliefRgb = readonly [number, number, number];
export type ClayReliefShape = 'cushion' | 'disc' | 'sphere';
export interface ClayReliefRequest {
  width: number;
  height: number;
  radius: number;
  layer: ClayLayerId;
  /** Shape is independent of physical depth. A sphere is always explicit. */
  shape?: ClayReliefShape;
  face: ClayReliefRgb;
  edge: ClayReliefRgb;
  lightX: number;
  lightY: number;
  volume: number;
  /** Local highlight multiplier; does not alter profile, pigment or shadows. */
  specularFactor?: number;
  /** Pixels per CSS pixel; bounded internally by the bitmap budget. */
  quality: number;
  bevelWidth?: number;
  rise?: number;
  /** Fixed camera offset; zero disables the sidewall without changing the light. */
  projectionX?: number;
  projectionY?: number;
}
export interface ClayReliefGeometry {
  shape: ClayReliefShape;
  width: number; height: number; radius: number;
  topWidth: number; topHeight: number; topRadius: number;
  projectionX: number; projectionY: number;
  bevel: number; rise: number; pixelWidth: number; pixelHeight: number;
}
export interface ClayReliefDistance { d: number; nx: number; ny: number }
export interface ClayReliefBitmap { width: number; height: number; data: Uint8ClampedArray }
export const CLAY_RELIEF_MAX_PIXELS = 250_000;
export const CLAY_RELIEF_MAX_SIDE = 4096;
const reliefClamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const reliefFinite = (n: number | undefined, fallback: number) => Number.isFinite(n) ? n! : fallback;
const clayReliefShape = (request: ClayReliefRequest): ClayReliefShape => request.shape === 'sphere' || request.shape === 'disc' || request.shape === 'cushion'
  ? request.shape : request.layer === 'detail' ? 'disc' : 'cushion';

/** Signed distance is positive inside; (nx,ny) points out of the rounded rectangle. */
export function clayRoundedRectDistance(x: number, y: number, halfWidth: number, halfHeight: number, radius: number): ClayReliefDistance {
  const qx = Math.abs(x) - (halfWidth - radius), qy = Math.abs(y) - (halfHeight - radius);
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0), outside = Math.hypot(ox, oy);
  const d = -(outside + Math.min(Math.max(qx, qy), 0) - radius);
  if (outside > 1e-9) return { d, nx: ox / outside * Math.sign(x), ny: oy / outside * Math.sign(y) };
  return qx > qy ? { d, nx: Math.sign(x), ny: 0 } : { d, nx: 0, ny: Math.sign(y) };
}

/** Elliptical shoulder joins a flat face with zero slope, without blurring its edge. */
export function clayEllipseProfile(distance: number, bevel: number, rise: number): { height: number; slope: number } {
  if (![distance, bevel, rise].every(Number.isFinite) || !(bevel > 0) || !(rise > 0)) return { height: 0, slope: 0 };
  const u = reliefClamp(distance / bevel);
  if (u >= 1) return { height: rise, slope: 0 };
  const root = Math.sqrt(Math.max(0, 2 * u - u * u));
  return { height: rise * root, slope: (rise / bevel) * (1 - u) / Math.max(1e-4, root) };
}

export function clayReliefNormal(point: ClayReliefDistance, slope: number): [number, number, number] {
  const amount = Math.max(0, reliefFinite(slope, 0));
  const x = reliefFinite(point.nx, 0) * amount, y = reliefFinite(point.ny, 0) * amount;
  const length = Math.hypot(x, y, 1);
  return [x / length, y / length, 1 / length];
}

export function clayReliefGeometry(request: ClayReliefRequest): ClayReliefGeometry | null {
  const { width, height } = request;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width > 16_384 || height > 16_384) return null;
  const profile = (CLAY_LAYERS[request.layer] ?? CLAY_LAYERS.control).surface;
  const shape = clayReliefShape(request), sphere = shape === 'sphere';
  const minimum = Math.min(width, height);
  const radius = reliefClamp(reliefFinite(request.radius, 0), 0, minimum / 2);
  const volume = reliefClamp(reliefFinite(request.volume, 1), 0, 3);
  // The outer silhouette still defines DOM bounds and alpha. Only the top face
  // recedes from its bottom/right edges; camera direction never follows light.
  const projectionX = reliefClamp(reliefFinite(request.projectionX, sphere ? 0 : profile.projectionX) * volume, 0, width * .15);
  const projectionY = reliefClamp(reliefFinite(request.projectionY, sphere ? 0 : profile.projectionY) * volume, 0, height * .15);
  const topWidth = width - projectionX, topHeight = height - projectionY;
  const topMinimum = Math.min(topWidth, topHeight);
  const topRadius = Math.min(radius, topMinimum / 2);
  const baseWidth = Math.max(.001, reliefFinite(request.bevelWidth, profile.bevelWidth));
  const baseRise = Math.max(0, reliefFinite(request.rise, profile.rise));
  const cap = Math.min(topRadius * .65, topHeight * .22, topMinimum / 2);
  // Discs keep a flat face even at detail level; only an explicit sphere spans
  // the full radius. Volume changes a sphere's height, not its dome footprint.
  const bevel = sphere ? topMinimum / 2 : Math.min(baseWidth * volume, cap);
  const rise = sphere ? bevel * .5 * volume : bevel * baseRise / baseWidth;
  const quality = reliefClamp(reliefFinite(request.quality, 1), .1, 2);
  const scale = Math.min(quality, Math.sqrt(CLAY_RELIEF_MAX_PIXELS / (width * height)), CLAY_RELIEF_MAX_SIDE / Math.max(width, height));
  const pixelWidth = Math.max(1, Math.floor(width * scale));
  const pixelHeight = Math.max(1, Math.floor(height * scale));
  return { shape, width, height, radius, topWidth, topHeight, topRadius, projectionX, projectionY, bevel, rise, pixelWidth, pixelHeight };
}

interface ClayReliefLighting {
  light: readonly [number, number, number]; half: readonly [number, number, number];
  lightXY: readonly [number, number]; flatBroad: number; flatCore: number;
  sigma: number; flatCrest: number; sphere: boolean; specularFactor: number;
}
function clayReliefLighting(request: ClayReliefRequest): ClayReliefLighting {
  const lx = -.55 * reliefClamp(reliefFinite(request.lightX, 1), -1, 1);
  const ly = -.70 * reliefClamp(reliefFinite(request.lightY, 1), -1, 1);
  const length = Math.hypot(lx, ly, 1.25);
  const light = [lx / length, ly / length, 1.25 / length] as const;
  const halfLength = Math.hypot(light[0], light[1], light[2] + 1);
  const half = [light[0] / halfLength, light[1] / halfLength, (light[2] + 1) / halfLength] as const;
  const xyLength = Math.hypot(lx, ly);
  const sigma = request.layer === 'foundation' ? .18 : .17;
  return { light, half, lightXY: xyLength ? [lx / xyLength, ly / xyLength] : [0, 0],
    flatBroad: Math.pow(half[2], 12), flatCore: Math.pow(half[2], 50),
    sigma, flatCrest: Math.exp(-.5 * Math.pow(.3197 / sigma, 2)), sphere: clayReliefShape(request) === 'sphere',
    specularFactor: reliefClamp(reliefFinite(request.specularFactor, 1), 0, 2) };
}

function clayShadeWithLighting(point: ClayReliefDistance, slope: number, face: ClayReliefRgb, edge: ClayReliefRgb, lighting: ClayReliefLighting, verticalWall = false): [number, number, number] {
  // The rounded shoulder approaches this vertical normal continuously. The wall
  // keeps the material's calibrated edge pigment, not an added black outline.
  const [nx, ny, nz] = verticalWall ? [point.nx, point.ny, 0] : clayReliefNormal(point, slope);
  const { light, half } = lighting;
  const diffuse = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
  const bodyShade = reliefClamp(1 - diffuse / light[2]);
  const bodyLift = reliefClamp(diffuse / light[2] - 1, 0, .05);
  const nh = Math.max(0, nx * half[0] + ny * half[1] + nz * half[2]);
  // Art-directed broad softbox approximation, not an exact area-light BRDF.
  // Excess over the flat response leaves the measured face pigment unchanged.
  const crest = Math.max(0, (Math.exp(-.5 * Math.pow((slope - .3197) / lighting.sigma, 2)) - lighting.flatCrest) / (1 - lighting.flatCrest));
  const facing = Math.sqrt(Math.max(0, point.nx * lighting.lightXY[0] + point.ny * lighting.lightXY[1]));
  const specular = reliefClamp(lighting.specularFactor * (lighting.sphere
    ? Math.max(0, .16 * (Math.pow(nh, 12) - lighting.flatBroad) + .43 * (Math.pow(nh, 50) - lighting.flatCore))
    : .52 * crest * facing));
  const result: [number, number, number] = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const pigment = reliefClamp(reliefFinite(face[c], 255), 0, 255);
    const rim = reliefClamp(reliefFinite(edge[c], pigment), 0, 255);
    const shaded = pigment + (rim - pigment) * bodyShade;
    const body = shaded + (255 - shaded) * bodyLift;
    result[c] = reliefClamp(body + (255 - body) * specular, 0, 255);
  }
  return result;
}

/** One diagnostic sample; independent of DOM/Canvas and useful for light tests. */
export function clayReliefSample(request: ClayReliefRequest, x: number, y: number): [number, number, number, number] | null {
  const geometry = clayReliefGeometry(request);
  if (!geometry || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  const outer = clayRoundedRectDistance(x, y, geometry.width / 2, geometry.height / 2, geometry.radius);
  const projected = geometry.projectionX > 0 || geometry.projectionY > 0;
  const point = projected ? clayRoundedRectDistance(x + geometry.projectionX / 2, y + geometry.projectionY / 2, geometry.topWidth / 2, geometry.topHeight / 2, geometry.topRadius) : outer;
  const { slope } = clayEllipseProfile(point.d, geometry.bevel, geometry.rise);
  return [...clayShadeWithLighting(point, slope, request.face, request.edge, clayReliefLighting(request), projected && point.d < 0), reliefClamp(outer.d + .5) * 255];
}

/** Conservative fully covered flat span, measured from the rectangle's top-left. */
function clayReliefFlatSpan(width: number, height: number, radius: number, inset: number, y: number, sampleWidth: number, pixelWidth: number): [number, number] {
  const cornerInset = Math.max(radius, inset), absY = Math.abs(y);
  const half = absY <= height / 2 - cornerInset ? width / 2 - inset
    : absY <= height / 2 - inset ? width / 2 - cornerInset : -1;
  return half >= 0 ? [Math.max(0, Math.ceil((width / 2 - half) / sampleWidth - .5)), Math.min(pixelWidth - 1, Math.floor((width / 2 + half) / sampleWidth - .5))] : [pixelWidth, -1];
}

/** Pure pixel buffer; texture, contact shadows and HTML content stay outside it. */
export function rasterizeClayRelief(request: ClayReliefRequest): ClayReliefBitmap | null {
  const geometry = clayReliefGeometry(request);
  if (!geometry) return null;
  const { width, height, radius, topWidth, topHeight, topRadius, projectionX, projectionY, bevel, rise, pixelWidth, pixelHeight } = geometry;
  const projected = projectionX > 0 || projectionY > 0;
  const lighting = clayReliefLighting(request);
  const data = new Uint8ClampedArray(pixelWidth * pixelHeight * 4);
  const sampleWidth = width / pixelWidth, sampleHeight = height / pixelHeight;
  const coverageWidth = Math.max(sampleWidth, sampleHeight);
  const face = request.face.map(channel => reliefClamp(reliefFinite(channel, 255), 0, 255));
  // A flat, fully covered pixel is exactly the input pigment. These conservative
  // crossed rectangles lie inside the eroded silhouette, so they need no SDF,
  // normal, exponentials or temporary arrays. Curved shoulders use the old path.
  const flatInset = Math.max(bevel, coverageWidth / 2);
  for (let py = 0; py < pixelHeight; py++) {
    const y = (py + .5) * sampleHeight - height / 2;
    const topY = y + projectionY / 2;
    let [flatFirst, flatLast] = clayReliefFlatSpan(topWidth, topHeight, topRadius, flatInset, topY, sampleWidth, pixelWidth);
    if (projected) {
      // A capped top radius can slightly protrude at a corner. Intersect with an
      // opaque outer span so the fast path cannot overwrite silhouette alpha.
      const [outerFirst, outerLast] = clayReliefFlatSpan(width, height, radius, coverageWidth / 2, y, sampleWidth, pixelWidth);
      flatFirst = Math.max(flatFirst, outerFirst); flatLast = Math.min(flatLast, outerLast);
    }
    for (let px = 0; px < pixelWidth; px++) {
      const index = (py * pixelWidth + px) * 4;
      if (px >= flatFirst && px <= flatLast) {
        data[index] = face[0]; data[index + 1] = face[1]; data[index + 2] = face[2]; data[index + 3] = 255;
        continue;
      }
      const x = (px + .5) * sampleWidth - width / 2;
      const outer = clayRoundedRectDistance(x, y, width / 2, height / 2, radius);
      const alpha = reliefClamp(outer.d / coverageWidth + .5);
      if (!alpha) continue;
      const point = projected ? clayRoundedRectDistance(x + projectionX / 2, topY, topWidth / 2, topHeight / 2, topRadius) : outer;
      if (point.d >= bevel && alpha === 1) {
        data[index] = face[0]; data[index + 1] = face[1]; data[index + 2] = face[2]; data[index + 3] = 255;
        continue;
      }
      const { slope } = clayEllipseProfile(point.d, bevel, rise);
      const rgb = clayShadeWithLighting(point, slope, request.face, request.edge, lighting, projected && point.d < 0);
      data[index] = rgb[0]; data[index + 1] = rgb[1]; data[index + 2] = rgb[2]; data[index + 3] = Math.round(alpha * 255);
    }
  }
  return { width: pixelWidth, height: pixelHeight, data };
}

/** Canvas is only the encoder. Unsupported environments retain the existing CSS. */
export function renderClayRelief(request: ClayReliefRequest): string | null {
  if (typeof document === 'undefined') return null;
  const bitmap = rasterizeClayRelief(request);
  if (!bitmap) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const image = context.createImageData(bitmap.width, bitmap.height);
    image.data.set(bitmap.data);
    context.putImageData(image, 0, 0);
    return canvas.toDataURL('image/png');
  } catch { return null; }
}
