import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_MATERIAL_SETTINGS,
  getMaterialVariables,
  MATERIAL_STORAGE_KEY,
  normalizeMaterialSettings,
  readMaterialSettings,
  saveMaterialSettings,
} from './materialSettings.ts';

test('material preferences reject invalid schema and bound numeric controls independently', () => {
  for (const value of [undefined, null, false, [], 'top-right']) {
    assert.deepEqual(normalizeMaterialSettings(value), DEFAULT_MATERIAL_SETTINGS);
  }
  assert.deepEqual(normalizeMaterialSettings({ volume: -20, shadowSoftness: 6, shadowStrength: NaN, light: 'url(invalid)' }), {
    volume: 0.6, shadowSoftness: 1.5, shadowStrength: 1, light: 'top-left',
  });
  assert.deepEqual(normalizeMaterialSettings({ volume: 1.151111, shadowSoftness: Infinity, shadowStrength: 0, light: 'bottom-right' }), {
    volume: 1.15, shadowSoftness: 1, shadowStrength: 0.5, light: 'bottom-right',
  });
});

test('all source corners agree with opposite shadow vectors, gradient angle, and highlight origin', () => {
  const cases = [
    ['top-left', '1', '1', '135deg', '0%', '0%'],
    ['top-right', '-1', '1', '225deg', '100%', '0%'],
    ['bottom-left', '1', '-1', '45deg', '0%', '100%'],
    ['bottom-right', '-1', '-1', '315deg', '100%', '100%'],
  ] as const;
  for (const [light, x, y, angle, originX, originY] of cases) {
    const variables = getMaterialVariables({ volume: 1.2, shadowSoftness: 0.8, shadowStrength: 1.4, light });
    assert.equal(variables['--clay-volume'], '1.2');
    assert.equal(variables['--clay-shadow-softness'], '0.8');
    assert.equal(variables['--clay-shadow-strength'], '1.4');
    assert.equal(variables['--clay-light-x'], x);
    assert.equal(variables['--clay-light-y'], y);
    assert.equal(variables['--clay-light-angle'], angle);
    assert.equal(variables['--clay-light-origin-x'], originX);
    assert.equal(variables['--clay-light-origin-y'], originY);
  }
});

test('material persistence round-trips settings and safely falls back for corrupt or unavailable storage', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const settings = { volume: 1.3, shadowSoftness: 0.7, shadowStrength: 1.2, light: 'top-right' as const };
  assert.equal(saveMaterialSettings(settings, storage), true);
  assert.deepEqual(readMaterialSettings(storage), settings);
  values.set(MATERIAL_STORAGE_KEY, '{broken json');
  assert.deepEqual(readMaterialSettings(storage), DEFAULT_MATERIAL_SETTINGS);
  assert.equal(saveMaterialSettings(settings), false);
  assert.deepEqual(readMaterialSettings(), DEFAULT_MATERIAL_SETTINGS);
  const blocked = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('quota'); } };
  assert.deepEqual(readMaterialSettings(blocked), DEFAULT_MATERIAL_SETTINGS);
  assert.equal(saveMaterialSettings(settings, blocked), false);
});
