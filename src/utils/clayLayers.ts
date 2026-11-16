import { materialShadow } from './materialStyle';

export type ClayLayerId = 'foundation' | 'control' | 'detail';
export interface ClayShadowProfile {
  x: number; y: number; blur: number; spread?: number; opacity: number;
}
/** Shared surface geometry. Shape and physical level are independent. */
export interface ClaySurfaceProfile {
  readonly bevelWidth: number;
  readonly rise: number;
  readonly faceTopMix: number;
  /** Fixed camera projection of the colored sidewall, independent of lighting. */
  readonly projectionX: number;
  readonly projectionY: number;
}
export interface ClayLayerProfile {
  id: ClayLayerId;
  level: 1 | 2 | 3;
  label: string;
  purpose: string;
  readonly surface: Readonly<ClaySurfaceProfile>;
  ambient: ClayShadowProfile;
  contact: ClayShadowProfile;
  crest: ClayShadowProfile;
  shoulder: ClayShadowProfile;
  lip: ClayShadowProfile;
  falloff: ClayShadowProfile;
  placement: { inset: number; gap: number; radius: number; minTouchTarget: number; guidance: string };
}

/** Physical depth is a role, not a global multiplier or DOM z-index. */
export const CLAY_LAYERS: Record<ClayLayerId, ClayLayerProfile> = {
  foundation: {
    id: 'foundation', level: 1, label: 'Основа', purpose: 'Большой поднос, доска, панель или контейнер композиции',
    surface: { bevelWidth: 20, rise: 10, faceTopMix: .8, projectionX: 3, projectionY: 6 },
    ambient: { x: 4, y: 10, blur: 16, spread: -5, opacity: .22 },
    contact: { x: 1, y: 3, blur: 5, spread: -1, opacity: .12 },
    crest: { x: 3, y: 4, blur: 4, opacity: .9 },
    shoulder: { x: 8, y: 10, blur: 14, opacity: .5 },
    lip: { x: -3, y: -6, blur: 6, opacity: .7 },
    falloff: { x: -6, y: -10, blur: 14, opacity: .30 },
    placement: { inset: 24, gap: 24, radius: 36, minTouchTarget: 0, guidance: 'Оставлять широкую видимую полку вокруг объектов; вложенный радиус меньше радиуса основы.' },
  },
  control: {
    id: 'control', level: 2, label: 'Объект', purpose: 'Кнопка, поле, карточка действия, дорожка или переключатель',
    surface: { bevelWidth: 10, rise: 5.5, faceTopMix: .7, projectionX: 1.5, projectionY: 3 },
    ambient: { x: 2, y: 5, blur: 8, spread: -3, opacity: .18 },
    contact: { x: .5, y: 2, blur: 2.5, opacity: .16 },
    crest: { x: 1.8, y: 2.5, blur: 2.7, opacity: .92 },
    shoulder: { x: 4, y: 5, blur: 7, opacity: .5 },
    lip: { x: -1.5, y: -3.5, blur: 3.5, opacity: .7 },
    falloff: { x: -3, y: -6, blur: 8, opacity: .3 },
    placement: { inset: 12, gap: 12, radius: 22, minTouchTarget: 44, guidance: 'Объект лежит на основе с короткой контактной тенью; детали размещаются внутри с отдельным отступом.' },
  },
  detail: {
    id: 'detail', level: 3, label: 'Деталь', purpose: 'Медальон, иконка, индикатор или бегунок; форма шара задаётся отдельно',
    surface: { bevelWidth: 6, rise: 3, faceTopMix: .65, projectionX: 1, projectionY: 2 },
    ambient: { x: 1, y: 2, blur: 3, spread: -1, opacity: .12 },
    contact: { x: .5, y: 1.2, blur: 1.5, opacity: .22 },
    crest: { x: .7, y: 1, blur: 1, opacity: .9 },
    shoulder: { x: 1.4, y: 2, blur: 3, opacity: .25 },
    lip: { x: -.7, y: -1.2, blur: 1.5, opacity: .6 },
    falloff: { x: -1.2, y: -2, blur: 3, opacity: .28 },
    placement: { inset: 4, gap: 8, radius: 10, minTouchTarget: 44, guidance: 'Уровень детали не означает шар: диск сохраняет плоское лицо и локальную фаску, sphere задаётся явно для бусины. Маленький интерактивный знак получает невидимую область 44px; обычный текст остаётся чистым.' },
  },
};

export const CLAY_LAYER_IDS: readonly ClayLayerId[] = ['foundation', 'control', 'detail'];
export function getClayLayer(id: ClayLayerId): ClayLayerProfile {
  return CLAY_LAYERS[id] ?? CLAY_LAYERS.control;
}

export interface ClayLayerColors { shadowRgb: string; edge: string; receiverShadowRgb?: string }
export interface ClayLayerShadowOptions { softness?: number; specular?: number }
const finiteScale = (value: number | undefined, fallback = 1) => Number.isFinite(value) ? Math.max(.1, Math.min(4, value!)) : fallback;

export function computeLayerShadowLayers(layer: ClayLayerId, colors: ClayLayerColors, scale = 1, options: ClayLayerShadowOptions = {}): string[] {
  const profile = getClayLayer(layer);
  const size = finiteScale(scale), softness = finiteScale(options.softness), specular = finiteScale(options.specular);
  const receiverShadowRgb = colors.receiverShadowRgb ?? colors.shadowRgb;
  const px = (value: number) => `${Number((value * size).toFixed(3))}px`;
  const shadow = (value: ClayShadowProfile, inset: boolean, color: string) => materialShadow([
    inset ? 'inset' : '', px(value.x), px(value.y), px(value.blur * softness),
    value.spread === undefined ? '' : px(value.spread), color,
  ].filter(Boolean).join(' '));
  return [
    shadow(profile.ambient, false, `rgba(${receiverShadowRgb}, ${profile.ambient.opacity})`),
    shadow(profile.contact, false, `rgba(${receiverShadowRgb}, ${profile.contact.opacity})`),
    shadow(profile.crest, true, `rgba(255,255,255,${Math.min(1, profile.crest.opacity * specular)})`),
    shadow(profile.shoulder, true, `rgba(255,255,255,${Math.min(1, profile.shoulder.opacity * specular)})`),
    shadow(profile.lip, true, `color-mix(in srgb, ${colors.edge} ${Number((profile.lip.opacity * 100).toFixed(2))}%, transparent)`),
    shadow(profile.falloff, true, `color-mix(in srgb, ${colors.edge} ${Number((profile.falloff.opacity * 100).toFixed(2))}%, transparent)`),
  ];
}

export function computeLayerShadow(layer: ClayLayerId, colors: ClayLayerColors, scale = 1, options: ClayLayerShadowOptions = {}): string {
  return computeLayerShadowLayers(layer, colors, scale, options).join(', ');
}

/** Generate on each element, not :root, so its own color tokens resolve locally. */
export function getClayLayerCss(layer: ClayLayerId, colors: ClayLayerColors = { shadowRgb: 'var(--clay-shadow-rgb,100,79,119)', edge: 'var(--clay-edge,#a27ccc)' }, selector = `.clay-layer-${layer}`): string {
  const profile = getClayLayer(layer);
  const shadow = computeLayerShadow(layer, colors).replaceAll('var(--clay-volume, 1)', 'var(--clay-layer-scale, 1) * var(--clay-volume, 1)');
  return `${selector} {\n  --clay-layer-level: ${profile.level};\n  --clay-layer-scale: 1;\n  --clay-layer-inset: ${profile.placement.inset}px;\n  --clay-layer-gap: ${profile.placement.gap}px;\n  --clay-layer-radius: ${profile.placement.radius}px;\n  --clay-layer-min-target: ${profile.placement.minTouchTarget}px;\n  --clay-bevel-width: ${profile.surface.bevelWidth}px;\n  --clay-rise: ${profile.surface.rise}px;\n  --clay-face-top-mix: ${profile.surface.faceTopMix};\n  --clay-layer-shadow: ${shadow};\n  box-shadow: var(--clay-layer-shadow);\n}`;
}
