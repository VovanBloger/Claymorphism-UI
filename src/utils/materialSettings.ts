export type ClayLightDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface MaterialSettings {
  volume: number;
  shadowSoftness: number;
  shadowStrength: number;
  light: ClayLightDirection;
}

export const MATERIAL_STORAGE_KEY = 'claycraft.material.v1';
export const DEFAULT_MATERIAL_SETTINGS: Readonly<MaterialSettings> = Object.freeze({
  volume: 1,
  shadowSoftness: 1,
  shadowStrength: 1,
  light: 'top-left',
});

export const CLAY_LIGHT_DIRECTIONS: { value: ClayLightDirection; label: string; arrow: string }[] = [
  { value: 'top-left', label: 'Сверху слева', arrow: '↖' },
  { value: 'top-right', label: 'Сверху справа', arrow: '↗' },
  { value: 'bottom-left', label: 'Снизу слева', arrow: '↙' },
  { value: 'bottom-right', label: 'Снизу справа', arrow: '↘' },
];

const bounded = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.round(Math.min(max, Math.max(min, value)) * 100) / 100
    : fallback;

/** Treat persisted preferences as untrusted data, including old or malformed schemas. */
export function normalizeMaterialSettings(value: unknown): MaterialSettings {
  const input = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    volume: bounded(input.volume, 0.6, 1.5, 1),
    shadowSoftness: bounded(input.shadowSoftness, 0.6, 1.5, 1),
    shadowStrength: bounded(input.shadowStrength, 0.5, 1.5, 1),
    light: CLAY_LIGHT_DIRECTIONS.some(direction => direction.value === input.light)
      ? input.light as ClayLightDirection
      : 'top-left',
  };
}

/** Source corner, shadow direction and gradient orientation always move together. */
export function getMaterialVariables(value: MaterialSettings): Record<string, string> {
  const settings = normalizeMaterialSettings(value);
  const sourceRight = settings.light.endsWith('right');
  const sourceBottom = settings.light.startsWith('bottom');
  const angle = sourceBottom ? (sourceRight ? 315 : 45) : (sourceRight ? 225 : 135);
  return {
    '--clay-volume': String(settings.volume),
    '--clay-shadow-softness': String(settings.shadowSoftness),
    '--clay-shadow-strength': String(settings.shadowStrength),
    '--clay-light-x': sourceRight ? '-1' : '1',
    '--clay-light-y': sourceBottom ? '-1' : '1',
    '--clay-light-angle': `${angle}deg`,
    '--clay-light-origin-x': sourceRight ? '100%' : '0%',
    '--clay-light-origin-y': sourceBottom ? '100%' : '0%',
  };
}

type MaterialStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function getBrowserMaterialStorage(): MaterialStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function readMaterialSettings(storage?: Pick<MaterialStorage, 'getItem'>): MaterialSettings {
  try {
    return normalizeMaterialSettings(JSON.parse(storage?.getItem(MATERIAL_STORAGE_KEY) || 'null'));
  } catch {
    return { ...DEFAULT_MATERIAL_SETTINGS };
  }
}

/** A full or blocked storage must never prevent live material changes. */
export function saveMaterialSettings(settings: MaterialSettings, storage?: Pick<MaterialStorage, 'setItem'>): boolean {
  if (!storage) return false;
  try {
    storage.setItem(MATERIAL_STORAGE_KEY, JSON.stringify(normalizeMaterialSettings(settings)));
    return true;
  } catch {
    return false;
  }
}
