import test from 'node:test';
import assert from 'node:assert/strict';
import { CLAY_LAYERS } from './clayLayers';
import {
  CLAY_RELIEF_MAX_PIXELS, CLAY_RELIEF_MAX_SIDE, clayRoundedRectDistance,
  clayEllipseProfile, clayReliefGeometry, clayReliefNormal, clayReliefSample,
  rasterizeClayRelief, renderClayRelief, type ClayReliefRequest,
} from './clayReliefRenderer';

const button: ClayReliefRequest = {
  width: 260, height: 82, radius: 33, layer: 'control',
  face: [255, 159, 152], edge: [251, 124, 123], lightX: 1, lightY: 1, volume: 1, quality: 1,
};
const near = (a: number, b: number, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≉ ${b}`);

test('rounded-rectangle SDF measures side and corner distances with outward normals', () => {
  assert.deepEqual(clayRoundedRectDistance(0, 0, 50, 30, 10), { d: 30, nx: 0, ny: 0 });
  const left = clayRoundedRectDistance(-45, 0, 50, 30, 10);
  assert.deepEqual(left, { d: 5, nx: -1, ny: 0 });
  const corner = clayRoundedRectDistance(40 + Math.SQRT1_2 * 10, 20 + Math.SQRT1_2 * 10, 50, 30, 10);
  near(corner.d, 0); near(corner.nx, Math.SQRT1_2); near(corner.ny, Math.SQRT1_2);
  assert.ok(clayRoundedRectDistance(50, 30, 50, 30, 10).d < 0);
});

test('elliptical shoulder is finite at its outline, tangent at its face, with measured internal crest', () => {
  for (const [width, rise, expected] of [[10, 5.5, 4.97459], [20, 10, 9.22610]]) {
    const distance = width * (1 - .3197 / Math.sqrt((rise / width) ** 2 + .3197 ** 2));
    near(distance, expected, .001);
    near(clayEllipseProfile(distance, width, rise).slope, .3197);
    assert.deepEqual(clayEllipseProfile(width, width, rise), { height: rise, slope: 0 });
    const edge = clayEllipseProfile(0, width, rise);
    assert.equal(edge.height, 0); assert.ok(Number.isFinite(edge.slope));
    near(Math.hypot(...clayReliefNormal({ d: distance, nx: -1, ny: 0 }, .3197)), 1);
  }
  assert.deepEqual(clayEllipseProfile(NaN, 10, 5), { height: 0, slope: 0 });
});

test('a flat face preserves its exact pigment and lower coral shoulder uses its calibrated edge', () => {
  assert.deepEqual(clayReliefSample(button, 0, 0), [...button.face, 255]);
  const edge = clayReliefSample(button, 0, 40.8)!;
  assert.ok(edge[0] >= 251, 'red should stay saturated rather than brown under RGB multiplication');
  assert.ok(edge[1] >= 124 && edge[1] < 159);
  const bright = clayReliefSample(button, 0, -36)!;
  assert.ok(bright[1] > 195, 'broad crest must brighten the straight top shoulder, not only its corner');
});

test('local specular factor controls only highlights, keeps its default, and clamps safely', () => {
  for (const [request, x, y] of [
    [button, 0, -36],
    [{ ...button, width: 44, height: 44, radius: 22, shape: 'sphere' }, -6, -8],
  ] as [ClayReliefRequest, number, number][]) {
    const sample = (factor?: number) => clayReliefSample({ ...request, specularFactor: factor }, x, y)!;
    assert.deepEqual(sample(), sample(1));
    assert.deepEqual(sample(NaN), sample(1));
    assert.deepEqual(sample(-10), sample(0));
    assert.deepEqual(sample(10), sample(2));
    assert.ok(sample(1)[1] > sample(0)[1], 'zero removes the crest, not diffuse lighting');
    assert.ok(sample(2)[1] >= sample(1)[1]);
    assert.deepEqual(clayReliefGeometry({ ...request, specularFactor: 0 }), clayReliefGeometry({ ...request, specularFactor: 2 }));
    assert.deepEqual(clayReliefSample({ ...request, specularFactor: 0 }, 0, 0), clayReliefSample({ ...request, specularFactor: 2 }, 0, 0));
  }
});

test('changing light direction mirrors the same geometry and colors in both axes', () => {
  const unprojected = { ...button, projectionX: 0, projectionY: 0 };
  for (const [x, y] of [[-125, -3], [22, -36], [-118, -28], [45, 35]]) {
    const original = clayReliefSample(unprojected, x, y)!;
    const horizontal = clayReliefSample({ ...unprojected, lightX: -1 }, -x, y)!;
    const vertical = clayReliefSample({ ...unprojected, lightY: -1 }, x, -y)!;
    original.forEach((value, i) => { near(value, horizontal[i]); near(value, vertical[i]); });
  }
});

test('sidewall uses fixed camera projection and original alpha without changing dimensions', () => {
  const geometry = clayReliefGeometry(button)!;
  assert.equal(geometry.projectionX, 1.5); assert.equal(geometry.projectionY, 3);
  assert.equal(geometry.topWidth, button.width - 1.5); assert.equal(geometry.topHeight, button.height - 3);
  assert.deepEqual(clayReliefGeometry({ ...button, lightX: -1, lightY: -1 }), geometry, 'light must not move the camera');
  const foundation = clayReliefGeometry({ ...button, layer: 'foundation', volume: 2 })!;
  assert.equal(foundation.projectionX, 6); assert.equal(foundation.projectionY, 12);
  const detail = clayReliefGeometry({ ...button, layer: 'detail' })!;
  assert.equal(detail.projectionX, 1); assert.equal(detail.projectionY, 2);
  const bounded = clayReliefGeometry({ ...button, width: 4, height: 3, projectionX: 1e8, projectionY: 1e8 })!;
  assert.ok(bounded.topWidth >= 3.4 && bounded.topHeight >= 2.55);
  const projected = rasterizeClayRelief(button)!;
  const original = rasterizeClayRelief({ ...button, projectionX: 0, projectionY: 0 })!;
  assert.equal(projected.width, original.width); assert.equal(projected.height, original.height);
  for (let i = 3; i < projected.data.length; i += 4) assert.equal(projected.data[i], original.data[i], 'sidewall must retain original silhouette coverage');
  assert.deepEqual(clayReliefSample(button, 0, 40), [...button.edge, 255], 'exposed bottom sidewall is colored material, not a black border');
});

test('profiles scale local bevels together and preserve full explicit sphere footprints', () => {
  const profile = clayReliefGeometry(button)!;
  assert.equal(profile.bevel, CLAY_LAYERS.control.surface.bevelWidth);
  assert.equal(profile.rise, CLAY_LAYERS.control.surface.rise);
  const smaller = clayReliefGeometry({ ...button, volume: .5 })!;
  near(smaller.bevel, profile.bevel / 2); near(smaller.rise, profile.rise / 2);
  const detail = { ...button, width: 44, height: 44, radius: 22, layer: 'detail' as const };
  assert.equal(clayReliefGeometry(detail)!.bevel, 6);
  assert.equal(clayReliefGeometry(detail)!.rise, 3);
  assert.deepEqual(clayReliefSample(detail, 0, 0), [...button.face, 255]);
  const sphere = { ...detail, shape: 'sphere' as const };
  assert.equal(clayReliefGeometry(sphere)!.bevel, 22);
  assert.equal(clayReliefGeometry(sphere)!.rise, 11);
  assert.equal(clayReliefGeometry({ ...sphere, volume: .5 })!.bevel, 22);
  assert.equal(clayReliefGeometry({ ...sphere, volume: .5 })!.rise, 5.5);
  assert.deepEqual(clayReliefSample(sphere, 0, 0), [...button.face, 255]);
  assert.deepEqual(clayReliefSample({ ...button, volume: 0 }, 0, -36), [...button.face, 255]);
});

test('physical layer never implicitly creates a sphere; discs keep their broad flat face', () => {
  for (const layer of ['foundation', 'control', 'detail'] as const) {
    const request = { ...button, layer, width: 100, height: 100, radius: 50 };
    const regular = clayReliefGeometry(request)!;
    assert.notEqual(regular.shape, 'sphere');
    assert.ok(regular.bevel < Math.min(regular.topWidth, regular.topHeight) / 2);
    const sphere = clayReliefGeometry({ ...request, shape: 'sphere' })!;
    assert.equal(sphere.bevel, 50); assert.equal(sphere.rise, 25);
    assert.equal(sphere.projectionX, 0); assert.equal(sphere.projectionY, 0);
  }
  const disc = { ...button, layer: 'detail' as const, shape: 'disc' as const, width: 74, height: 74, radius: 37, volume: 2.3 };
  const geometry = clayReliefGeometry(disc)!;
  near(geometry.bevel, 13.8); near(geometry.rise, 6.9);
  assert.deepEqual(clayReliefSample(disc, 10, 0), [...button.face, 255], 'profile medallion retains a broad plateau at scale 2.3');
  const dome = clayReliefSample({ ...disc, shape: 'sphere' }, 10, 0)!;
  assert.notDeepEqual(dome, [...button.face, 255], 'explicit sphere has curved shading away from its center');
});

test('pixel buffers are deterministic, antialiased, and obey scale, side and area budgets', () => {
  const small = { ...button, width: 24, height: 24, radius: 12, layer: 'detail' as const, quality: 2 };
  const first = rasterizeClayRelief(small)!;
  assert.equal(first.width, 48); assert.equal(first.height, 48);
  assert.deepEqual(first, rasterizeClayRelief(small));
  assert.equal(first.data[3], 0, 'outside rounded corners is transparent');
  const alpha = Array.from(first.data).filter((_, i) => i % 4 === 3);
  assert.ok(alpha.some(value => value > 0 && value < 255));
  for (const [width, height] of [[16_384, 16_384], [16_384, 1], [3000, 3000], [.1, .1]]) {
    const bounded = clayReliefGeometry({ ...button, width, height, quality: 100 })!;
    assert.ok(bounded.pixelWidth * bounded.pixelHeight <= CLAY_RELIEF_MAX_PIXELS);
    assert.ok(bounded.pixelWidth <= CLAY_RELIEF_MAX_SIDE && bounded.pixelHeight <= CLAY_RELIEF_MAX_SIDE);
    assert.ok(bounded.pixelWidth >= 1 && bounded.pixelHeight >= 1);
  }
});

test('flat-plateau acceleration is byte-identical to full SDF lighting at fractional sizes and quality', () => {
  // Independently reconstruct the unoptimized loop from diagnostic samples: no
  // plateau condition or span bounds are shared with the accelerated rasterizer.
  const cases: ClayReliefRequest[] = [
    { ...button, width: 132, height: 116, radius: 32, layer: 'foundation' },
    { ...button, width: 90.3, height: 51.7, radius: 18.4, quality: 1.5 },
    { ...button, width: 95, height: 46, radius: 23, volume: .23, quality: .65, lightX: -1 },
    { ...button, width: 53, height: 51, radius: 14, volume: 0, quality: 2, face: [132.5, 111.5, 100.6] },
    { ...button, width: 32, height: 32, radius: 16, layer: 'detail', lightY: -1 },
    { ...button, width: 36, height: 14, radius: 3, layer: 'detail', volume: 3 },
    { ...button, width: 41, height: 23, radius: 0, quality: .1 },
    { ...button, width: 47, height: 47, radius: 23.5, bevelWidth: .01, projectionX: 200, projectionY: 200, quality: 2 },
    { ...button, width: 81, height: 51, radius: 20, projectionX: 0, projectionY: 0 },
    { ...button, width: 32, height: 32, radius: 16, layer: 'detail', shape: 'sphere' },
    { ...button, width: 49, height: 49, radius: 24.5, layer: 'control', shape: 'sphere', volume: .5 },
  ];
  for (const request of cases) {
    const geometry = clayReliefGeometry(request)!;
    const { pixelWidth, pixelHeight, width, height, radius } = geometry;
    const reference = new Uint8ClampedArray(pixelWidth * pixelHeight * 4);
    const sx = width / pixelWidth, sy = height / pixelHeight;
    for (let py = 0; py < pixelHeight; py++) for (let px = 0; px < pixelWidth; px++) {
      const x = (px + .5) * sx - width / 2, y = (py + .5) * sy - height / 2;
      const { d } = clayRoundedRectDistance(x, y, width / 2, height / 2, radius);
      const alpha = Math.max(0, Math.min(1, d / Math.max(sx, sy) + .5));
      if (!alpha) continue;
      const sample = clayReliefSample(request, x, y)!;
      const i = (py * pixelWidth + px) * 4;
      reference[i] = sample[0]; reference[i + 1] = sample[1]; reference[i + 2] = sample[2];
      reference[i + 3] = Math.round(alpha * 255);
    }
    assert.deepEqual(rasterizeClayRelief(request)!.data, reference, JSON.stringify(request));
  }
});

test('malformed settings are bounded and unusable sizes or SSR return the CSS fallback', () => {
  for (const width of [0, -1, NaN, Infinity, 20_000]) assert.equal(rasterizeClayRelief({ ...button, width }), null);
  const unusual = { ...button, width: 12, height: 8, radius: Infinity, volume: NaN, quality: NaN, lightX: NaN, lightY: 0 };
  const sample = clayReliefSample(unusual, 0, 0)!;
  assert.ok(sample.every(Number.isFinite));
  assert.ok(sample.every(value => value >= 0 && value <= 255));
  assert.equal(renderClayRelief(button), null, 'node/SSR must not require a Canvas implementation');
});
