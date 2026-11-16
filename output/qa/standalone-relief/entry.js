import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClayCustomComponent as Pill } from './pill.source';
import Status from './status.source';
import './pill.css';
import './reference-clay.css';

const roots = new Map();
const components = {pill:Pill,status:Status};
const errors = [];
const neighbour = document.querySelector('#untouched');
function neighbourState() {
  const style = getComputedStyle(neighbour);
  return JSON.stringify({html:neighbour.outerHTML,background:style.background,shadow:style.boxShadow,filter:style.filter,radius:style.borderRadius});
}
const baseline = neighbourState();
function readReport() {
  const cases = Object.fromEntries(Object.keys(components).map(id=>{
    const host = document.querySelector(`#${id}-mount`);
    return [id,{mounted:roots.has(id),domElements:host.querySelectorAll('*').length,rendered:host.querySelectorAll('[data-clay-rendered="true"]').length,images:[...host.querySelectorAll('*')].filter(el=>el.style.getPropertyValue('--clay-relief-image').startsWith('url(')).length}];
  }));
  return {cases,runtimeStyleCount:document.querySelectorAll('style[data-clay-relief-runtime]').length,unmarkedNeighbourUnchanged:neighbourState()===baseline,unmarkedNeighbourRendered:neighbour.hasAttribute('data-clay-rendered'),errors:[...errors]};
}
function refresh() { document.querySelector('#report').textContent=JSON.stringify(readReport(),null,2); }
function mount(id) {
  if (roots.has(id)) return;
  const root = createRoot(document.querySelector(`#${id}-mount`));
  roots.set(id,root);
  root.render(React.createElement(components[id]));
  refresh();
}
function unmount(id) { roots.get(id)?.unmount(); roots.delete(id); refresh(); }
document.querySelectorAll('[data-mount]').forEach(button=>button.addEventListener('click',()=>mount(button.dataset.mount)));
document.querySelectorAll('[data-unmount]').forEach(button=>button.addEventListener('click',()=>unmount(button.dataset.unmount)));
document.querySelector('#mount-all').addEventListener('click',()=>Object.keys(components).forEach(mount));
document.querySelector('#unmount-all').addEventListener('click',()=>Object.keys(components).forEach(unmount));
window.addEventListener('error',event=>{errors.push(String(event.message));refresh();});
window.addEventListener('unhandledrejection',event=>{errors.push(String(event.reason));refresh();});
Object.assign(window,{qaRead:readReport,qaMount:mount,qaUnmount:unmount});
setInterval(refresh,200);
Object.keys(components).forEach(mount);
