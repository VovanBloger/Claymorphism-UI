export type ClayTextureDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const CLAY_TEXTURE_TILE_SIZE = 256;
export const DEFAULT_CLAY_TEXTURE_INTENSITY = 0.035;
export const MAX_CLAY_TEXTURE_INTENSITY = 0.12;

// SVG azimuth uses +x to the right and +y downward, unlike CSS gradient angles.
const LIGHT_AZIMUTH: Record<ClayTextureDirection, number> = {
  'top-left': 225,
  'top-right': 315,
  'bottom-left': 135,
  'bottom-right': 45,
};

/**
 * A periodic, neutral-gray height field for `background-blend-mode: soft-light`.
 * Keep this at its intrinsic 256px tile size: stretching it changes the grain scale.
 * The alpha is deliberately restrained; zero returns `none` without a texture layer.
 * This module has no browser, asset, or network dependency and can be copied into exports.
 */
export function clayTextureBackground(
  direction: ClayTextureDirection = 'top-left',
  intensity = DEFAULT_CLAY_TEXTURE_INTENSITY,
): string {
  const alpha = Number.isFinite(intensity)
    ? Math.round(Math.min(MAX_CLAY_TEXTURE_INTENSITY, Math.max(0, intensity)) * 1000) / 1000
    : DEFAULT_CLAY_TEXTURE_INTENSITY;
  if (alpha === 0) return 'none';
  const azimuth = Object.hasOwn(LIGHT_AZIMUTH, direction) ? LIGHT_AZIMUTH[direction] : LIGHT_AZIMUTH['top-left'];

  // Four periodic pixels around the tile feed both the .7px blur and lighting kernel.
  // The diffuse value for a flat surface is sin(55deg); center that value at gray .5.
  const neutralIntercept = (0.5 - 1.7 * Math.sin(55 * Math.PI / 180)).toFixed(5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><filter id="clay" x="-4" y="-4" width="264" height="264" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feTurbulence x="0" y="0" width="256" height="256" type="fractalNoise" baseFrequency=".035 .045" numOctaves="2" seed="17" stitchTiles="stitch" result="micro"/><feTile in="micro" x="-4" y="-4" width="264" height="264" result="periodicMicro"/><feColorMatrix in="periodicMicro" type="luminanceToAlpha" result="height"/><feGaussianBlur in="height" stdDeviation=".7" result="softHeight"/><feDiffuseLighting in="softHeight" surfaceScale="1.3" diffuseConstant="1" lighting-color="#fff" result="relief"><feDistantLight azimuth="${azimuth}" elevation="55"/></feDiffuseLighting><feComponentTransfer in="relief" result="neutralRelief"><feFuncR type="linear" slope="1.7" intercept="${neutralIntercept}"/><feFuncG type="linear" slope="1.7" intercept="${neutralIntercept}"/><feFuncB type="linear" slope="1.7" intercept="${neutralIntercept}"/></feComponentTransfer><feTurbulence x="0" y="0" width="256" height="256" type="fractalNoise" baseFrequency=".009 .012" numOctaves="2" seed="37" stitchTiles="stitch" result="broad"/><feColorMatrix in="broad" type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 0 1" result="neutralBroad"/><feComposite in="neutralRelief" in2="neutralBroad" operator="arithmetic" k2=".55" k3=".45"/><feComponentTransfer><feFuncA type="table" tableValues="${alpha} ${alpha}"/></feComponentTransfer></filter><rect width="256" height="256" filter="url(#clay)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Standalone CSS can embed this literal as the --clay-texture-image fallback. */
export const DEFAULT_CLAY_TEXTURE_IMAGE = clayTextureBackground();
