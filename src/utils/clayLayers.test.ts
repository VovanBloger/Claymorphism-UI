import test from 'node:test';
import assert from 'node:assert/strict';
import { transformSync } from 'esbuild';
import { CLAY_LAYER_IDS, computeLayerShadow, computeLayerShadowLayers, getClayLayer, getClayLayerCss } from './clayLayers';
import { computeClayStyles, generateComponentCode, getComponentPhysicalLayer, type GeneratorConfig } from './clayEngine';
import { materialShadow } from './materialStyle';

test('physical levels give large foundations, controls and small details distinct contact and placement rules', () => {
  const [foundation, control, detail] = CLAY_LAYER_IDS.map(getClayLayer);
  assert.deepEqual([foundation.level, control.level, detail.level], [1, 2, 3]);
  assert.ok(foundation.ambient.blur > control.ambient.blur && control.ambient.blur > detail.ambient.blur);
  assert.ok(foundation.crest.blur > control.crest.blur && control.crest.blur > detail.crest.blur);
  assert.ok(detail.contact.opacity > detail.ambient.opacity, 'small details need contact, not a foggy large shadow');
  assert.ok(foundation.placement.inset > control.placement.inset && control.placement.inset > detail.placement.inset);
  assert.equal(detail.placement.minTouchTarget, 44, 'small visible details must retain a usable invisible hit area');
});

test('each physical profile produces standalone CSS with shared light, volume and external strength', () => {
  for (const layer of CLAY_LAYER_IDS) {
    const layers = computeLayerShadowLayers(layer, { shadowRgb: 'var(--clay-shadow-rgb,100,79,119)', edge: 'var(--clay-edge,#a27ccc)' });
    assert.equal(layers.length, 6);
    assert.equal(layers.filter(value => value.startsWith('inset ')).length, 4);
    assert.ok(layers.every(value => value.includes('--clay-light-x') && value.includes('--clay-light-y') && value.includes('--clay-volume') && value.includes('--clay-shadow-softness')));
    assert.equal(layers.filter(value => value.includes('--clay-shadow-strength')).length, 2, 'external strength must not wash out the volume');
    assert.ok(layers[4].includes('color-mix(in srgb, var(--clay-edge,#a27ccc)'));
    assert.equal(materialShadow(layers.join(', ')), layers.join(', '), 'already converted layers must not be scaled twice');
    const css = getClayLayerCss(layer);
    assert.ok(css.includes(`--clay-layer-level: ${getClayLayer(layer).level};`));
    assert.ok(css.includes('box-shadow: var(--clay-layer-shadow);'));
    assert.ok(!css.includes('undefined') && !css.includes('NaN'));
  }
  assert.equal(computeLayerShadow('control', {shadowRgb:'100,79,119',edge:'#a27ccc'}, Number.NaN), computeLayerShadow('control', {shadowRgb:'100,79,119',edge:'#a27ccc'}));
});

test('generator resolves archetype defaults and explicit depth roles consistently in CSS, React and tokens', () => {
  const config: GeneratorConfig = {
    componentType: 'pill-button',
    physics: {presetId:'lavender',surfaceMode:'raised',borderRadius:24,depth:12,blurSoftness:24,specularIntensity:.9,padding:16},
    titleText:'Clay',subtitleText:'',metricValue:'',metricDelta:'',ctaLabel:'Go',selectedAssetId:'star_mascot',
  };
  assert.equal(getComponentPhysicalLayer('pill-button'), 'control');
  assert.equal(getComponentPhysicalLayer('peeking-card'), 'foundation');
  assert.equal(JSON.parse(generateComponentCode(config, 'tokens')).physicalLayer.id, 'control');
  assert.equal(JSON.parse(generateComponentCode({...config,componentType:'peeking-card'}, 'tokens')).physicalLayer.id, 'foundation');
  for (const layer of CLAY_LAYER_IDS) {
    const selected = {...config,physics:{...config.physics,layer}};
    const styles = computeClayStyles(selected.physics);
    assert.equal(styles.physicalLayer, layer);
    assert.equal(styles.boxShadow, computeLayerShadow(layer, {shadowRgb:'104, 78, 168',edge:'#a27ccc'}));
    const tokens = JSON.parse(generateComponentCode(selected, 'tokens'));
    assert.equal(tokens.physicalLayer.selection, 'explicit');
    assert.deepEqual(tokens.shadowLayers, styles.shadowLayers);
    const css = generateComponentCode(selected, 'css');
    assert.ok(css.includes(`--clay-layer-level: ${getClayLayer(layer).level};`));
    const jsx = generateComponentCode(selected, 'react');
    assert.ok(jsx.includes(styles.boxShadow));
    assert.ok(!jsx.includes('clayLayers') && !jsx.includes('computeLayerShadow('), 'exports must not depend on project-only helpers');
    assert.doesNotThrow(() => transformSync(jsx, {loader:'tsx',format:'esm'}));
  }
  const notch = JSON.parse(generateComponentCode({...config,componentType:'sticker-notch-nav'}, 'tokens'));
  assert.equal(notch.physicalLayers.panel.id, 'foundation');
  assert.equal(notch.physicalLayers.medallion.id, 'control');
  assert.equal(notch.physicalLayers.icon.id, 'detail');
});
