import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import {
  computeConcentricRadius,
  computeClayStyles,
  generateComponentCode,
  UPLOADED_CLAY_ASSETS,
  CLAY_COLOR_PRESETS,
  GeneratorConfig,
} from './clayEngine';

test('computeConcentricRadius calculates nested radius accurately and enforces minimum 8px', () => {
  assert.equal(computeConcentricRadius(32, 24), 19);
  assert.equal(computeConcentricRadius(12, 30), 8);
  assert.equal(computeConcentricRadius(9999, 16), 9999);
});

test('every new reference component exports compilable TSX with working CSS and escaped content', () => {
  const source = readFileSync(new URL('../components/ReferenceElements.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../components/reference-clay.css', import.meta.url), 'utf8');
  const kinds = ['status-pills', 'action-rows', 'clay-calendar', 'product-card', 'workout-card', 'activity-rings', 'filter-chips'] as const;
  for (const componentType of kinds) {
    const config: GeneratorConfig = {
      componentType,
      physics: { presetId: 'mint', surfaceMode: 'raised', borderRadius: 28, depth: 9, blurSoftness: 18, specularIntensity: .9, padding: 20 },
      titleText: 'A "soft" bag <hello>\nwith a new line', subtitleText: '', metricValue: '1', metricDelta: '', ctaLabel: 'Go', selectedAssetId: 'star_mascot',
    };
    const exported = generateComponentCode(config, 'react', {source, css});
    const compiled = transformSync(exported, { loader: 'tsx', format: 'esm' });
    assert.ok(compiled.code.includes('GeneratedClayComponent'), componentType);
    assert.ok(exported.includes(JSON.stringify(config.titleText)), 'title must be a JS string, not interpolated JSX');
    const exportedCss = generateComponentCode(config, 'css', {source, css});
    assert.ok(exportedCss.includes('prefers-reduced-motion'));
    assert.ok(exportedCss.includes('.ref-surface'));
    assert.equal(JSON.parse(generateComponentCode(config, 'tokens')).component, componentType);
  }
});

test('computeClayStyles returns 4-layer shadow stack for raised mode and 3-layer for recessed mode', () => {
  const raised = computeClayStyles({
    presetId: 'lavender',
    surfaceMode: 'raised',
    borderRadius: 28,
    depth: 12,
    blurSoftness: 24,
    specularIntensity: 0.9,
    padding: 24,
  });

  assert.equal(raised.shadowLayers.length, 4);
  assert.ok(raised.boxShadow.includes('inset '));
  assert.equal(raised.borderRadius, '28px');

  const recessed = computeClayStyles({
    presetId: 'cream',
    surfaceMode: 'recessed',
    borderRadius: 999,
    depth: 10,
    blurSoftness: 18,
    specularIntensity: 0.85,
    padding: 16,
  });

  assert.equal(recessed.shadowLayers.length, 3);
  assert.equal(recessed.borderRadius, '9999px');
});

test('generateComponentCode produces valid React JSX, CSS, and JSON Tokens with selected 3D asset', () => {
  const config = {
    componentType: 'peeking-card' as const,
    physics: {
      presetId: 'cream' as const,
      surfaceMode: 'raised' as const,
      borderRadius: 32,
      depth: 14,
      blurSoftness: 28,
      specularIntensity: 0.92,
      padding: 24,
    },
    selectedAssetId: 'girl_cat_mascot',
    titleText: 'Welcome Back',
    subtitleText: 'Login to continue your journey',
    metricValue: '1,248',
    metricDelta: '+18% this week',
    ctaLabel: 'Login',
  };

  const reactCode = generateComponentCode(config, 'react');
  assert.ok(reactCode.includes('export function ClayPeekingMascotCard'));
  assert.ok(reactCode.includes('Welcome Back'));
  assert.ok(reactCode.includes('/assets/aistudio/____________ChatGPT_14_____._2026__.__04_20_48_8694cf43.png'));

  const cssCode = generateComponentCode(config, 'css');
  assert.ok(cssCode.includes('.clay-element'));
  assert.ok(cssCode.includes('.clay-icon-badge'));

  const jsonTokens = JSON.parse(generateComponentCode(config, 'tokens'));
  assert.equal(jsonTokens.component, 'peeking-card');
  assert.equal(jsonTokens.asset.id, 'girl_cat_mascot');
  assert.ok(jsonTokens.viscousAnimationPhysics);
  assert.equal(Object.keys(CLAY_COLOR_PRESETS).length, 8);
  assert.equal(UPLOADED_CLAY_ASSETS.length, 12);

  const bottomNavReact = generateComponentCode({ ...config, componentType: 'bottom-nav' }, 'react');
  assert.ok(bottomNavReact.includes('ClayBottomNavDock'));
  assert.ok(bottomNavReact.includes('md:grid-cols-4'));

  const sliderReact = generateComponentCode(
    { ...config, componentType: 'clay-slider', physics: { ...config.physics, thumbRadius: 8 } },
    'react'
  );
  assert.ok(sliderReact.includes('Clay3DSlider'));
  assert.ok(sliderReact.includes('const thumbRadius = 8;'));
  assert.ok(sliderReact.includes('step="any"'));

  const toggleReact = generateComponentCode({ ...config, componentType: 'clay-toggle' }, 'react');
  assert.ok(toggleReact.includes('ClayPhysicalToggle'));
});
