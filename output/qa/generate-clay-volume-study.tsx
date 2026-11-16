import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, writeFileSync } from 'node:fs';
import { ClaySculptedIcon } from '../../src/components/ReferenceElements';

const referenceCss = readFileSync(new URL('../../src/components/reference-clay.css', import.meta.url), 'utf8');
const variants = [
  { id: 'current', title: '01 · Текущий материал', note: 'Действующие 6 теней. Блик привязан к краю.' },
  { id: 'face', title: '02 · CSS: лицо и фаска', note: 'Светлый гребень внутри: 5px / 10px. Цветная внешняя стенка.' },
  { id: 'height', title: '03 · SVG: матовый рельеф', note: '75% постоянного цвета, 25% diffuse. Два слабых мягких блика.' },
];

function shape(name: 'heart'|'bell'|'settings', prefix: string, size = 42) {
  return renderToStaticMarkup(<ClaySculptedIcon name={name} size={size}/>, {identifierPrefix: prefix});
}
function scene(id: string) {
  return `<div class="study-scene">
  <div class="study-small-row">
    <button class="ref-surface study-surface mint study-status" data-clay-layer="control"><span class="study-content"><i class="ref-surface study-surface mint study-dot" data-clay-layer="detail"></i>Active</span></button>
    <button class="ref-surface study-surface coral study-heart" data-clay-layer="control" aria-label="Нравится"><span class="study-content">${shape('heart', id + '-heart')}</span></button>
  </div>
  <div class="ref-surface study-surface lavender study-panel" data-clay-layer="foundation">
    <div class="study-content study-panel-content">
      <div class="study-profile-row"><i class="ref-surface study-surface mint study-avatar" data-clay-layer="detail"></i><div class="study-lines"><i class="ref-surface study-surface lavender" data-clay-layer="detail"></i><i class="ref-surface study-surface lavender" data-clay-layer="detail"></i></div></div>
      <button class="ref-surface study-surface coral study-confirm" data-clay-layer="control"><span class="study-content">Confirm</span></button>
      <button class="ref-surface study-surface sky study-toggle" data-clay-layer="control" aria-label="Уведомления" role="switch" aria-checked="true"><i class="ref-surface study-surface cream study-knob" data-clay-layer="detail"></i></button>
    </div>
  </div>
  <div class="study-utility-row"><button class="ref-surface study-surface cream study-square" data-clay-layer="control" aria-label="Уведомления"><span class="study-content">${shape('bell',id+'-bell')}</span></button><button class="ref-surface study-surface lavender study-square" data-clay-layer="control" aria-label="Настройки"><span class="study-content">${shape('settings',id+'-settings')}</span></button><span class="study-scale-label">Одинаковые размеры<br>и текстура</span></div>
  </div>`;
}

function filter(id: string, erode: number, blur: number, scale: number) {
  return `<filter id="${id}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB" primitiveUnits="userSpaceOnUse">
  <feMorphology in="SourceAlpha" operator="erode" radius="${erode}" result="inner"/>
  <feGaussianBlur in="inner" stdDeviation="${blur}" result="height"/>
  <feDiffuseLighting in="height" surfaceScale="${scale}" diffuseConstant="1.1" lighting-color="#fff" result="diffuse"><feDistantLight azimuth="232" elevation="55"/></feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="diffuse" operator="arithmetic" k1=".25" k2=".75" k3="0" k4="0" result="body"/>
  <feSpecularLighting in="height" surfaceScale="${scale}" specularConstant=".45" specularExponent="18" lighting-color="#fff" result="soft-specular"><feDistantLight azimuth="232" elevation="55"/></feSpecularLighting>
  <feSpecularLighting in="height" surfaceScale="${scale}" specularConstant=".15" specularExponent="42" lighting-color="#fff" result="crest"><feDistantLight azimuth="232" elevation="55"/></feSpecularLighting>
  <feComposite in="body" in2="soft-specular" operator="arithmetic" k1="0" k2="1" k3=".45" k4="0" result="soft-lit"/>
  <feComposite in="soft-lit" in2="crest" operator="arithmetic" k1="0" k2="1" k3=".5" k4="0" result="lit"/>
  <feComposite in="lit" in2="SourceAlpha" operator="in"/>
  </filter>`;
}

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Clay · три способа объёма</title><style>
${referenceCss}
*{box-sizing:border-box} :root{--font-display:Nunito,Arial,sans-serif;--clay-volume:1;--clay-shadow-softness:1;--clay-shadow-strength:1;--clay-light-x:1;--clay-light-y:1;--clay-light-angle:135deg;--clay-light-origin-x:0%;--clay-light-origin-y:0%}
body{margin:0;background:#faf8fc;color:#29233e;font-family:var(--font-display);padding:30px 34px 40px}h1{font-size:25px;margin:0 0 9px;letter-spacing:-.7px}header>p{margin:0;font-size:13px;color:#776985;max-width:950px;line-height:1.6}.study-grid{display:grid;grid-template-columns:repeat(3,minmax(330px,1fr));gap:24px;margin-top:25px}article{min-width:0;background:#fff;border:1px solid #ede7f2;border-radius:24px;padding:22px 20px 25px}h2{margin:0;font-size:17px;letter-spacing:-.35px}.study-note{font-size:11px;line-height:1.5;color:#8c7d98;min-height:34px;margin:7px 0 20px}.study-scene{max-width:310px;margin:auto}.study-surface{position:relative;isolation:isolate;border:0;--shape-radius:24px;--crest-inset:5px;border-radius:var(--shape-radius);background-repeat:repeat,no-repeat;background-size:256px 256px,auto}.study-surface[data-clay-layer=foundation]{--shape-radius:40px;--crest-inset:10px}.study-surface[data-clay-layer=detail]{--crest-inset:2px;--shape-radius:999px}.study-surface .study-content{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;gap:12px}.study-small-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding:0 5px}.study-status{width:168px;height:54px;--shape-radius:28px;font:800 20px var(--font-display)}.study-dot{width:15px;height:15px;display:block;--clay-top:#8af0ca;--clay-bottom:#42bc91;--clay-edge:#239875}.study-heart{width:70px;height:70px;--shape-radius:50%;display:grid;place-items:center}.study-panel{width:100%;height:330px;padding:28px 27px}.study-panel-content{height:100%;display:flex!important;flex-direction:column;align-items:stretch!important;gap:28px!important}.study-profile-row{display:flex;gap:22px;align-items:center;margin-bottom:1px}.study-avatar{width:74px;height:74px;display:block;--clay-layer-scale:1.7;--crest-inset:3px}.study-lines{display:grid;gap:13px;flex:1}.study-lines>i{display:block;height:19px;border-radius:12px;width:100%}.study-lines>i+ i{width:63%;height:14px}.study-confirm{height:82px;width:100%;--shape-radius:33px;--clay-shadow:104,78,168;font:800 32px var(--font-display);color:white;text-shadow:0 1.2px 1.2px #ba56576b;flex-shrink:0}.study-toggle{width:166px;height:51px;--shape-radius:28px;margin:0 3px;display:block}.study-knob{position:absolute;width:44px;height:44px;right:4px;top:3px;border-radius:50%;z-index:2;--clay-layer-scale:1.3}.study-utility-row{display:flex;gap:20px;align-items:center;margin:25px 0 0;padding:0 6px}.study-square{width:70px;height:70px;--shape-radius:23px;display:grid;place-items:center}.study-scale-label{font-size:10px;line-height:1.6;color:#93869e}.study-content>svg{position:relative;z-index:2;display:block}.study-surface:focus-visible{outline:2px solid #7052aa;outline-offset:5px}.study-grid button{cursor:default}.study-footnote{font-size:12px;line-height:1.7;color:#7f708b;margin:24px 0 0;max-width:1100px}
/* Keep contact delicate. Its receiver below coral Confirm is lavender, not coral. */
.face .study-surface,.height .study-surface{box-shadow:calc(2px * var(--clay-light-x)) calc(5px * var(--clay-light-y)) 8px -3px rgba(var(--clay-shadow),.18),.5px 2px 2.5px rgba(var(--clay-shadow),.16)}
.face .study-surface[data-clay-layer=foundation],.height .study-surface[data-clay-layer=foundation]{box-shadow:4px 10px 16px -5px rgba(var(--clay-shadow),.22),1px 3px 5px -1px rgba(var(--clay-shadow),.12)}
.face .study-surface[data-clay-layer=detail],.height .study-surface[data-clay-layer=detail]{box-shadow:1px 2px 3px -1px rgba(var(--clay-shadow),.12),.5px 1.2px 1.5px rgba(var(--clay-shadow),.22)}
/* Separate colored outer slope, recessed highlight crest, and calm face. No white outer outline. */
.face .study-surface{background-image:var(--clay-texture-image),linear-gradient(145deg,color-mix(in srgb,var(--clay-top) 24%,var(--clay-bottom)),var(--clay-bottom) 68%,var(--clay-edge));box-shadow:2px 5px 8px -3px rgba(var(--clay-shadow),.18),.5px 2px 2.5px rgba(var(--clay-shadow),.16),inset -.4px -2px 2px color-mix(in srgb,var(--clay-edge) 74%,transparent)}
.face .study-surface::before{content:"";position:absolute;pointer-events:none;z-index:0;inset:var(--crest-inset);border-radius:max(4px,calc(var(--shape-radius) - var(--crest-inset)));background-image:var(--clay-texture-image),linear-gradient(145deg,color-mix(in srgb,var(--clay-top) 44%,var(--clay-bottom)),color-mix(in srgb,var(--clay-top) 34%,var(--clay-bottom)));background-blend-mode:soft-light,normal;background-size:256px 256px,auto;box-shadow:inset 3px 4px 6px #ffffff73,inset -2px -3px 5px color-mix(in srgb,var(--clay-edge) 22%,transparent)}
.face .study-surface::after{content:"";position:absolute;pointer-events:none;z-index:1;inset:calc(var(--crest-inset) - 1px);padding:2.5px;border-radius:max(4px,calc(var(--shape-radius) - var(--crest-inset) + 1px));background:linear-gradient(145deg,#fffffff2 2%,#ffffffc9 24%,#ffffff1a 45%,transparent 58%,color-mix(in srgb,var(--clay-edge) 35%,transparent));mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;filter:blur(1px)}
.face .study-surface[data-clay-layer=foundation]::before{box-shadow:inset 6px 8px 10px #ffffff66,inset -4px -6px 9px color-mix(in srgb,var(--clay-edge) 28%,transparent)}
.face .study-surface[data-clay-layer=foundation]::after{padding:3.5px;filter:blur(1.5px)}
.face .study-surface[data-clay-layer=detail]::after{padding:1.5px;filter:blur(.65px)}
.face .study-heart::before,.face .study-heart::after{border-radius:50%}
/* Height map lighting belongs to a background-only pseudo element. */
.height .study-surface{background:transparent}
.height .study-surface::before{content:"";position:absolute;pointer-events:none;inset:0;z-index:0;border-radius:inherit;background-image:var(--clay-texture-image),linear-gradient(145deg,color-mix(in srgb,var(--clay-top) 44%,var(--clay-bottom)),color-mix(in srgb,var(--clay-top) 34%,var(--clay-bottom)));background-blend-mode:soft-light,normal;background-size:256px 256px,auto;filter:url(#study-control-height)}
.height .study-surface[data-clay-layer=foundation]::before{filter:url(#study-foundation-height)}
.height .study-surface[data-clay-layer=detail]::before{background-image:linear-gradient(145deg,var(--clay-top),var(--clay-bottom));filter:url(#study-detail-height)}
@media(max-width:1100px){.study-grid{grid-template-columns:1fr}article{max-width:440px;width:100%;margin:auto}body{padding:20px}.study-note{min-height:0}.study-panel{height:330px}}
</style></head><body><svg aria-hidden="true" width="0" height="0" style="position:absolute"><defs>${filter('study-control-height',4,7,16)}${filter('study-foundation-height',8,12,28)}${filter('study-detail-height',1.5,3,7)}</defs></svg><header><h1>Clay volume · одинаковая сцена, три способа рельефа</h1><p>Изолированное исследование. Текстура и палитра сохранены. Размеры, содержимое и зона клика одинаковы; текст и объёмные SVG-иконки не проходят через фильтр поверхности.</p></header><main class="study-grid">${variants.map(v=>`<article class="${v.id}"><h2>${v.title}</h2><p class="study-note">${v.note}</p>${scene(v.id)}</article>`).join('')}</main><p class="study-footnote">Сравниваем гребень блика, плавную боковину и нижнюю губу. У Confirm контактная тень получает оттенок лавандовой подложки. CSS face/rim отделяет белую вершину от внешнего края; SVG аппроксимирует склон через карту высоты. Это статические пробы, не новое поведение кнопок и не production-изменение.</p></body></html>`;
writeFileSync(new URL('./clay-volume-study.html', import.meta.url), html);
console.log('output/qa/clay-volume-study.html');
