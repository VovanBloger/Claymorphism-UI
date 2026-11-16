import test from 'node:test';
import assert from 'node:assert/strict';
import { transformSync } from 'esbuild';
import { materialBackground, materialFilter, materialShadow } from './materialStyle.ts';
import { computeClayStyles, generateComponentCode } from './clayEngine.ts';

test('shared shadows preserve rgba function boundaries, inset colors and negative spread', () => {
  const input = '3px 7px 10px -3px rgba(100,79,119,.28), inset -2px -4px 5px #b193dc';
  const result = materialShadow(input);
  assert.ok(result.includes('calc(-3px * var(--clay-volume, 1))'));
  assert.ok(result.includes('rgba(100, 79, 119, calc(.28 * var(--clay-shadow-strength, 1)))'));
  assert.ok(result.endsWith('#b193dc'));
  assert.equal((result.match(/--clay-light-x/g) || []).length, 2);
  assert.equal((result.match(/--clay-shadow-strength/g) || []).length, 1);
  assert.equal(materialShadow(result), result);
});

test('hex alpha and variable rgb shadows retain their color when strength is applied', () => {
  const result = materialShadow('0 3px 8px #9064c46b, 1px 2px 4px rgba(var(--surface-shadow), .2)');
  assert.ok(result.includes('rgba(144, 100, 196, calc(0.41961 * var(--clay-shadow-strength, 1)))'));
  assert.ok(result.includes('rgba(var(--surface-shadow), calc(.2 * var(--clay-shadow-strength, 1)))'));
  assert.equal(materialShadow('none'), 'none');
});

test('gradient direction mirrors white and tinted sphere highlights while preserving decorative ellipses', () => {
  const input = 'linear-gradient(145deg, #E5D2FF 0%, #C9AAF2 100%)';
  const result = materialBackground(input);
  assert.equal(result, 'linear-gradient(calc(var(--clay-light-angle, 135deg) + 10deg), #E5D2FF 0%, #C9AAF2 100%)');
  assert.equal(materialBackground(result), result);
  assert.ok(materialBackground('radial-gradient(circle at 32% 28%, #FFFFFF 0%, #DFD1FA 100%)').includes('--clay-light-origin-x'));
  const tintedSphere = 'radial-gradient(circle at 32% 28%, #FFE0E8 0%, #F7A3B8 52%, #E37892 100%)';
  const tintedResult = materialBackground(tintedSphere);
  assert.ok(tintedResult.includes('calc(32% + var(--clay-light-origin-x, 0%) * 0.3600)'));
  assert.ok(tintedResult.includes('calc(28% + var(--clay-light-origin-y, 0%) * 0.4400)'));
  assert.ok(tintedResult.endsWith('#FFE0E8 0%, #F7A3B8 52%, #E37892 100%)'));
  assert.equal(materialBackground(tintedResult), tintedResult);
  const cosmos = 'radial-gradient(ellipse at 20% 80%, #5582ff, transparent 40%)';
  assert.equal(materialBackground(cosmos), cosmos);
});

test('drop-shadow conversion handles nested rgba and keeps neighboring filters untouched', () => {
  const input = 'saturate(1.2) drop-shadow(3px 9px 9px rgba(34, 16, 84, .46)) blur(2px) drop-shadow(0 2px 3px #76548233)';
  const result = materialFilter(input);
  assert.ok(result.startsWith('saturate(1.2) drop-shadow('));
  assert.ok(result.includes(') blur(2px) drop-shadow('));
  assert.equal((result.match(/--clay-shadow-softness/g) || []).length, 2);
  assert.equal(materialFilter(result), result);
});

test('generator material and standalone exports carry CSS tokens without requiring the converter', () => {
  const physics = { presetId: 'lavender', surfaceMode: 'raised', borderRadius: 28, depth: 12, blurSoftness: 24, specularIntensity: .9, padding: 20 } as const;
  const styles = computeClayStyles(physics);
  assert.equal(styles.shadowLayers.length, 6);
  assert.ok(styles.background.includes('--clay-light-angle'));
  assert.ok(styles.boxShadow.includes('--clay-volume'));
  const config: Parameters<typeof generateComponentCode>[0] = { physics, componentType: 'kpi-card', titleText: 'Clay', subtitleText: '', metricValue: '', metricDelta: '', ctaLabel: 'Go', selectedAssetId: 'star_mascot' };
  for (const componentType of ['kpi-card', 'clay-avatar', 'clay-toggle', 'bottom-nav', 'clay-slider', 'pill-button', 'peeking-card', 'icon-input', 'bar-chart-card', 'donut-chart-card', 'promo-banner', 'track-list-card'] as const) {
    const output = generateComponentCode({ ...config, componentType }, 'react');
    assert.ok(output.includes('--clay-volume'), componentType);
    assert.ok(!output.includes('materialShadow('), componentType);
    assert.ok(!output.includes("from './materialStyle'"), componentType);
    assert.doesNotThrow(() => transformSync(output, { loader: 'tsx', format: 'esm' }), componentType);
  }
  const css = generateComponentCode(config, 'css');
  assert.match(css, /\.clay-slider-track\s*\{[^}]*--clay-light-angle[^}]*--clay-volume/s);
});
