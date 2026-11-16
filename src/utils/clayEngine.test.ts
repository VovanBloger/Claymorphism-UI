import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CLAY_RELIEF_CSS } from './clayRelief';
import { DEFAULT_CLAY_TEXTURE_IMAGE } from './clayTexture';
import {
  computeConcentricRadius,
  computeClayStyles,
  generateComponentCode,
  UPLOADED_CLAY_ASSETS,
  CLAY_COLOR_PRESETS,
  GeneratorConfig,
  GeneratorComponentType,
} from './clayEngine';

const exportSources = () => ({
  source: readFileSync(new URL('../components/ReferenceElements.tsx', import.meta.url), 'utf8'),
  css: readFileSync(new URL('../components/reference-clay.css', import.meta.url), 'utf8'),
  relief: {
    renderer: readFileSync(new URL('./clayReliefRenderer.ts', import.meta.url), 'utf8'),
    adapter: readFileSync(new URL('./clayRelief.ts', import.meta.url), 'utf8'),
    css: CLAY_RELIEF_CSS,
  },
});

test('computeConcentricRadius calculates nested radius accurately and enforces minimum 8px', () => {
  assert.equal(computeConcentricRadius(32, 24), 19);
  assert.equal(computeConcentricRadius(12, 30), 8);
  assert.equal(computeConcentricRadius(9999, 16), 9999);
});

test('Sticker Notch exports standalone TSX, its live CSS, and the original flight parameters', () => {
  const config: GeneratorConfig = {
    componentType:'sticker-notch-nav',
    physics:{presetId:'lavender',surfaceMode:'raised',borderRadius:28,depth:9,blurSoftness:18,specularIntensity:.9,padding:20},
    titleText:'',subtitleText:'',metricValue:'',metricDelta:'',ctaLabel:'',selectedAssetId:'magic_wand',
  };
  const notch = {
    source:readFileSync(new URL('../components/StickerNotchNav.tsx',import.meta.url),'utf8'),
    math:readFileSync(new URL('./notchMath.ts',import.meta.url),'utf8'),
    css:readFileSync(new URL('../components/sticker-notch-nav.css',import.meta.url),'utf8'),
  };
  const sources = {source:'',css:'',notch};
  const exported = generateComponentCode(config,'react',sources);
  assert.ok(!exported.includes("from '../utils/notchMath'"), 'geometry must be included in the exported module');
  assert.ok(transformSync(exported,{loader:'tsx',format:'esm'}).code.includes('StickerNotchNavDemo'));
  assert.equal(generateComponentCode(config,'css',sources),notch.css);
  assert.equal(JSON.parse(generateComponentCode(config,'tokens')).motion.maxHopPx,4.5);
  const require = createRequire(import.meta.url);
  const mod = {exports:{} as Record<string, unknown>};
  runInNewContext(transformSync(exported,{loader:'tsx',format:'cjs',jsx:'transform'}).code, {
    module:mod,exports:mod.exports,require:(id: string) => id.endsWith('.css') ? {} : require(id),
  });
  const Nav = mod.exports.StickerNotchNav as React.ComponentType<{activeId:string;onSelect:()=>void}>;
  const html = renderToStaticMarkup(React.createElement('div',null,
    React.createElement(Nav,{activeId:'create',onSelect:()=>{}}),
    React.createElement(Nav,{activeId:'chat',onSelect:()=>{}}),
  ));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  const references = [...html.matchAll(/url\(#([^)]+)\)/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'several menus must not share gradient/filter IDs');
  assert.ok(references.length >= 6 && references.every(id=>ids.includes(id)),'all exported SVG materials resolve locally');
  const paths = [...html.matchAll(/<path\s[^>]*d="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(paths.length,4);
  assert.equal(paths[0],paths[1],'the sidewall must follow the same live notch silhouette');
  assert.equal(paths[2],paths[3]);
  assert.notEqual(paths[0],paths[2],'a different active tab still moves the notch');
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

test('computeClayStyles uses six raised layers for four physical roles and keeps three recessed layers', () => {
  const raised = computeClayStyles({
    presetId: 'lavender',
    surfaceMode: 'raised',
    borderRadius: 28,
    depth: 12,
    blurSoftness: 24,
    specularIntensity: 0.9,
    padding: 24,
  });

  assert.equal(raised.shadowLayers.length, 6);
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

test('generator depth and specular retain their local scale without multiplying the shared light twice', () => {
  const physics = {presetId:'lavender' as const,surfaceMode:'raised' as const,borderRadius:28,depth:12,blurSoftness:24,specularIntensity:.9,padding:20};
  for (const layer of ['foundation','control','detail'] as const) {
    assert.deepEqual(computeClayStyles(physics,layer).materialTokens, {'--clay-layer-scale':1,'--clay-relief-specular':1});
    const varied = computeClayStyles({...physics,depth:24,specularIntensity:.45},layer);
    assert.deepEqual(varied.materialTokens, {'--clay-layer-scale':2,'--clay-relief-specular':.5});
    assert.ok(varied.cssString.includes('--clay-layer-scale: 2;'));
    assert.ok(varied.cssString.includes('--clay-relief-specular: 0.5;'));
    assert.ok(!varied.boxShadow.includes('--clay-layer-scale'),'fallback shadows already bake the local depth into their lengths');
    assert.ok(!varied.boxShadow.includes('var(--clay-volume, 1) * var(--clay-volume, 1)'));
  }
  assert.equal(computeClayStyles({...physics,surfaceMode:'floating-pill'}).materialTokens['--clay-layer-scale'],1.1);
  const config: GeneratorConfig = {componentType:'pill-button',physics:{...physics,depth:24,specularIntensity:.45},titleText:'',subtitleText:'',metricValue:'',metricDelta:'',ctaLabel:'Save',selectedAssetId:'star_mascot'};
  assert.deepEqual(JSON.parse(generateComponentCode(config,'tokens')).materialTokens, {'--clay-layer-scale':2,'--clay-relief-specular':.5});
});

test('all raised and recessed exports embed a scoped standalone renderer and render safely without a DOM', () => {
  const sources = exportSources();
  const require = createRequire(import.meta.url);
  const kinds: GeneratorComponentType[] = ['status-pills','action-rows','clay-calendar','product-card','workout-card','activity-rings','filter-chips','clay-avatar','kpi-card','icon-input','pill-button','peeking-card','bottom-nav','clay-slider','clay-toggle','bar-chart-card','donut-chart-card','promo-banner','track-list-card'];
  for (const componentType of kinds) for (const surfaceMode of ['raised', 'recessed'] as const) {
    const config: GeneratorConfig = {
      componentType,
      physics: {presetId:'lavender',surfaceMode,borderRadius:28,depth:18,blurSoftness:24,specularIntensity:.45,padding:20},
      titleText:'Soft clay',subtitleText:'Standalone',metricValue:'12',metricDelta:'+2',ctaLabel:'Save',selectedAssetId:'star_mascot',
    };
    const source = generateComponentCode(config, 'react', sources);
    assert.ok(source.includes('installClayRelief(root, { render: renderClayRelief })'), componentType);
    assert.ok(source.includes('return () => controller.dispose()'), componentType);
    const relativeImports = [...source.matchAll(/(?:from\s+|import\s+)['"](\.[^'"]+)['"]/g)].map(match => match[1]);
    assert.ok(relativeImports.every(path => path.endsWith('.css')), `${componentType}: project import leaked into export`);
    assert.ok(source.includes(DEFAULT_CLAY_TEXTURE_IMAGE), 'the runtime keeps the approved texture without a MaterialProvider');
    const compiled = transformSync(source, {loader:'tsx',format:'cjs',jsx:'transform'}).code;
    const mod = {exports:{} as Record<string, unknown>};
    runInNewContext(compiled, {module:mod,exports:mod.exports,require:(id: string) => id.endsWith('.css') ? {} : require(id)});
    const name = Object.keys(mod.exports).find(key => key === 'default' || /^Clay(?:PopOutAvatarCard|PhysicalToggle|BottomNavDock|3DSlider|KpiCard|BadgeInput|PeekingMascotCard|CustomComponent)$/.test(key));
    assert.ok(name, `missing public component: ${componentType}`);
    const html = renderToStaticMarkup(React.createElement(mod.exports[name] as React.ComponentType));
    assert.ok(html.includes('data-clay-export-root=""'), componentType);
    assert.ok(html.includes(`data-clay-surface="${surfaceMode}"`), `${componentType}:${surfaceMode}`);
    assert.ok(html.includes('--clay-layer-scale:1.5;'), `${componentType}: exported depth must reach the renderer`);
    assert.ok(html.includes('--clay-relief-specular:0.5;'), `${componentType}: exported highlight strength must reach the renderer`);
    const css = generateComponentCode(config, 'css', sources);
    assert.doesNotThrow(() => transformSync(css, {loader:'css'}), componentType);
    assert.ok(css.includes('[data-clay-rendered="true"]'), componentType);
    assert.ok(css.includes(DEFAULT_CLAY_TEXTURE_IMAGE), componentType);
  }
});

test('approved texture has a standalone fallback on raised foundations and controls, leaving details and wells clear', () => {
  const physics = {presetId:'lavender' as const,surfaceMode:'raised' as const,borderRadius:28,depth:12,blurSoftness:24,specularIntensity:.9,padding:20};
  for (const layer of ['foundation','control'] as const) assert.ok(computeClayStyles({...physics,layer}).background.includes(DEFAULT_CLAY_TEXTURE_IMAGE));
  assert.ok(!computeClayStyles({...physics,layer:'detail'}).background.includes('--clay-texture-image'));
  assert.ok(!computeClayStyles({...physics,surfaceMode:'recessed'}).background.includes('--clay-texture-image'));
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
