/** Generate the shared physical profiles into the standalone reference stylesheet. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getClayLayerCss, computeLayerShadow } from '../src/utils/clayLayers';
import { materialBackground, materialShadow } from '../src/utils/materialStyle';
import { DEFAULT_CLAY_TEXTURE_IMAGE } from '../src/utils/clayTexture';

const path = fileURLToPath(new URL('../src/components/reference-clay.css', import.meta.url));
const start = '/* BEGIN GENERATED CLAY PHYSICS */';
const end = '/* END GENERATED CLAY PHYSICS */';
const colors = { shadowRgb: 'var(--clay-shadow,var(--surface-shadow,100,79,119))', edge: 'var(--clay-edge,var(--surface-edge,#a27ccc))' };
// A declared role wins over legacy class defaults. Recessed wells keep their own
// inward profile even when they also use a palette or a legacy surface class.
const fallbackRaised = (selectors: string) => selectors.split(',').map(selector =>
  `${selector}:not(:where([data-clay-layer],[data-clay-surface="recessed"]))`,
).join(',');
const foundation = `[data-clay-layer="foundation"]:not(:where([data-clay-surface="recessed"])),${fallbackRaised('.clay-layer-foundation,.clay-board,.clay-card-cream,.clay-card-lavender,.clay-card-peach,.clay-card-butter,.clay-card-sky,.clay-sidebar-purple,.dashboard-sidebar,.studio-header')}`;
const control = `[data-clay-layer="control"]:not(:where([data-clay-surface="recessed"])),${fallbackRaised('.ref-surface,.clay-layer-control,.clay-btn-purple,.clay-btn-rose,.dashboard-profile-avatar')}`;
const detail = `[data-clay-layer="detail"]:not(:where(svg,img,[data-clay-text],.clay-detail-text,[data-clay-surface="recessed"])),${fallbackRaised('.clay-layer-detail')}:not(:where(svg,img,[data-clay-text],.clay-detail-text))`;
const thumb = computeLayerShadow('control', { shadowRgb: '92,140,102', edge: '#a3c78c' }, .8, { specular: .7 });
const textRelief = materialShadow('0.3px 0.8px 0.8px rgba(65,43,88,.18), -0.25px -0.4px 0.4px rgba(255,255,255,.4)');
const css = `${start}
/* Source: clayLayers.ts + clayTexture.ts. Regenerate: npm run material:generate.
 * Physical role is independent of z-index. A silhouette owns only one contact shadow.
 * Narrow crest + soft shoulder + lower lip + falloff give shape without dark halos. */
:root {--clay-texture-image:${DEFAULT_CLAY_TEXTURE_IMAGE}}
${getClayLayerCss('control', colors, control)}
${getClayLayerCss('foundation', colors, foundation)}
${getClayLayerCss('detail', colors, detail)}
/* Relief pigments are separate from the darker CSS fallback inset colors. */
.ref-surface.cream,.clay-board,.clay-card-cream {--clay-relief-face:#fcf8fa;--clay-relief-edge:#dacfd8}
.ref-surface.lavender,.clay-card-lavender {--clay-relief-face:#dec4ff;--clay-relief-edge:#bea6f7}
.ref-surface.coral,.clay-btn-rose {--clay-relief-face:#ff9f98;--clay-relief-edge:#fb7c7b}
.ref-surface.mint {--clay-relief-face:#b5efda;--clay-relief-edge:#82c8ad}
.ref-surface.sky,.clay-card-sky {--clay-relief-face:#afd8f7;--clay-relief-edge:#7db5df}
.ref-surface.butter,.clay-card-butter {--clay-relief-face:#ffeca0;--clay-relief-edge:#ebc35e}
.ref-surface.peach,.clay-card-peach {--clay-relief-face:#ffdcc7;--clay-relief-edge:#efad96}
.ref-confirm-card>.ref-confirm,.ref-confirm-card>.ref-switch {--clay-shadow:108,73,153}
.ref-surface {
  background-image:var(--clay-texture-image),linear-gradient(calc(var(--clay-light-angle,135deg) + 10deg),var(--clay-top),var(--clay-bottom));
  background-size:256px 256px,auto;
  background-repeat:repeat,no-repeat;
  background-blend-mode:soft-light,normal;
}
.ref-surface[data-clay-layer="detail"] {background-image:linear-gradient(calc(var(--clay-light-angle,135deg) + 10deg),var(--clay-top),var(--clay-bottom));background-blend-mode:normal}
.clay-board,.clay-card-cream,.clay-card-lavender,.clay-card-peach,.clay-card-butter,.clay-card-sky,.clay-sidebar-purple,.clay-btn-purple,.clay-btn-rose {
  background-image:var(--clay-texture-image),linear-gradient(calc(var(--clay-light-angle,135deg) + 10deg),var(--surface-top),var(--surface-bottom));
  background-size:256px 256px,auto;background-repeat:repeat,no-repeat;background-blend-mode:soft-light,normal;
}
.dashboard-sidebar {--surface-shadow:70,48,116;--surface-edge:#9578bd;background-image:var(--clay-texture-image),linear-gradient(calc(var(--clay-light-angle,135deg) + 30deg),#BEABE8,#AD95DE 48%,#9983D0);background-size:256px 256px,auto;background-blend-mode:soft-light,normal}
.studio-header {--surface-shadow:165,137,186;--surface-edge:#baa1d4;background-image:var(--clay-texture-image),linear-gradient(calc(var(--clay-light-angle,135deg) + 10deg),#e0cef7,#d0b6ef);background-size:256px 256px,auto;background-blend-mode:soft-light,normal}
.dashboard-profile-avatar {--surface-shadow:96,67,140;--surface-edge:#d7c1d3}
/* Geometry utilities are opt-in: never change existing component dimensions implicitly. */
.clay-stack {display:grid;padding:var(--clay-layer-inset);gap:var(--clay-layer-gap);border-radius:var(--clay-layer-radius)}
.clay-control {min-width:var(--clay-layer-min-target);min-height:var(--clay-layer-min-target);padding:var(--clay-layer-inset);gap:var(--clay-layer-gap);border-radius:var(--clay-layer-radius)}
[data-clay-text="raised"],.clay-detail-text,.clay-text-3d,.clay-sidebar-text-3d,.dashboard-nav-label {text-shadow:${textRelief}}
/* Text and sculpted SVGs cast on their own silhouette, never on a rectangular box. */
svg[data-clay-layer="detail"],[data-clay-layer="detail"][data-clay-text="raised"],.clay-detail-text {box-shadow:none}
.ref-status {min-width:0;gap:17px;padding:12px 23px}
.ref-status i {--clay-shadow:38,134,89;--clay-edge:#2e9972;flex-shrink:0;background:${materialBackground('radial-gradient(circle at 30% 26%,#c5ffe9 0%,#75dfb6 25%,#49ba92 70%,#329d78 100%)')}}
.ref-status:nth-child(2) i {--clay-shadow:188,143,75;--clay-edge:#c4921b;background:${materialBackground('radial-gradient(circle at 30% 26%,#fff4af 0%,#ffda50 25%,#f3b81c 70%,#d49b13 100%)')}}
.ref-status:nth-child(3) i {--clay-shadow:105,73,151;--clay-edge:#7853bb;background:${materialBackground('radial-gradient(circle at 30% 26%,#efdbff 0%,#be96f2 25%,#a477dc 70%,#875ac2 100%)')}}
/* The supporting tray stays visible around and below its three objects. */
.ref-segmented {padding:9px 9px 14px;gap:8px;border-radius:30px}
.ref-segmented button {border-radius:21px;font-size:14px;font-weight:800}
.ref-profile-dot {--clay-layer-scale:2.3}
.ref-switch>span {--clay-layer-scale:1.3}
.ref-confirm {--clay-layer-scale:1.2}
/* A tube, a recessed groove and a separate ball: three different geometries. */
.ref-vertical-control {width:48px;padding:13px 12px}
.ref-vertical-control input {width:14px;box-shadow:${materialShadow('inset 1.5px 2px 2.5px rgba(37,117,86,.4),inset -1px -1px 1px rgba(199,255,224,.65)')}}
.ref-vertical-control input::-webkit-slider-thumb {width:56px;height:56px;background:${materialBackground('linear-gradient(145deg,#e1f3c4,#d3ebb4)')};box-shadow:${thumb}}
.ref-vertical-control input::-moz-range-thumb {width:56px;height:56px;background:${materialBackground('linear-gradient(145deg,#e1f3c4,#d3ebb4)')};box-shadow:${thumb}}
@media(max-width:900px){.ref-vertical-control{width:36px;padding:12px 10px}.ref-vertical-control input{width:12px}.ref-vertical-control input::-webkit-slider-thumb{width:44px;height:44px}.ref-vertical-control input::-moz-range-thumb{width:44px;height:44px}}
@media(max-width:650px){.ref-confirm{font-size:clamp(14px,4.4vw,22px);gap:3px}.ref-confirm>svg{width:16px;height:16px;flex-shrink:0}.ref-status{font-size:13px;padding:11px 14px;gap:9px}.ref-segmented{padding:7px 7px 11px;gap:6px}.ref-segmented button{font-size:12px}.ref-vertical-control{width:32px;padding:11px 9px}.ref-vertical-control input{width:11px}.ref-vertical-control input::-webkit-slider-thumb{width:40px;height:40px}.ref-vertical-control input::-moz-range-thumb{width:40px;height:40px}}
${end}`;
const existing = readFileSync(path, 'utf8');
const before = existing.includes(start) ? existing.slice(0, existing.indexOf(start)).trimEnd() : existing.trimEnd();
const after = existing.includes(end) ? existing.slice(existing.indexOf(end) + end.length).trim() : '';
const result = `${before}\n\n${css}\n${after ? `\n${after}\n` : ''}`;
if (process.argv.includes('--check')) {
  if (result !== existing) throw new Error('Clay physics CSS is stale. Run npm run material:generate.');
} else if (result !== existing) writeFileSync(path, result);
