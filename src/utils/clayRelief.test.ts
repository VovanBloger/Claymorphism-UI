import test from 'node:test';
import assert from 'node:assert/strict';
import { installClayRelief } from './clayRelief';
import type { ClayReliefRequest } from './clayReliefRenderer';

/** Small DOM harness exercises scheduling/lifecycle; pixels belong to renderer tests. */
function browserHarness(count = 2) {
  const timers = new Map<number, () => void>();
  const listeners = new Map<string, () => void>();
  let nextTimer = 0, mutationCallback: (records: unknown[]) => void, disconnected = 0;
  const variables: Record<string, string> = { '--clay-top':'#ffaaa1', '--clay-bottom':'#ff817c', '--clay-edge':'#e36567', '--clay-light-x':'1', '--clay-light-y':'1', '--clay-volume':'1' };
  let contact = 'rgb(100, 70, 130) 2px 5px 8px -3px';
  class Element {
    nodeType = 1;
    namespaceURI = 'http://www.w3.org/1999/xhtml';
    tagName = 'BUTTON'; className = 'ref-surface coral'; hidden = false;
    offsetWidth = 180; offsetHeight = 80;
    dataset: Record<string, string> = { clayLayer:'control' };
    properties = new Map<string, string>();
    style = { getPropertyValue: (key: string) => this.properties.get(key) ?? '', setProperty: (key: string, value: string) => this.properties.set(key, value), removeProperty: (key: string) => this.properties.delete(key) };
    ownerDocument: unknown;
    parentElement: Element | null = null;
    removed = false;
    classList = { contains: (name: string) => this.className.split(' ').includes(name) };
    key(name: string) { return name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()); }
    getAttribute(name: string) { return name.startsWith('data-') ? this.dataset[this.key(name)] ?? null : null; }
    hasAttribute(name: string) { return this.getAttribute(name) !== null; }
    setAttribute(name: string, value: string) { if (name.startsWith('data-')) this.dataset[this.key(name)] = value; }
    removeAttribute(name: string) { delete this.dataset[this.key(name)]; }
    matches(selector: string) { return selector.split(',').some(part => part === '[data-clay-layer]' ? Boolean(this.dataset.clayLayer) : part.startsWith('.') && this.classList.contains(part.slice(1))); }
    closest() { return null; }
    querySelectorAll() { return []; }
    contains(other: Element) { return this === other; }
    remove() { this.removed = true; }
  }
  const elements = Array.from({ length: count }, () => new Element());
  const styles: Element[] = [];
  const context = {
    fillStyle: '#000000', clearRect() {}, fillRect() {},
    getImageData() {
      const values = this.fillStyle.startsWith('#') ? [1,3,5].map(i => parseInt(this.fillStyle.slice(i, i + 2), 16)) : this.fillStyle.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      return { data: [...values, 255] };
    },
  };
  const win = {
    Element, devicePixelRatio: 2, performance: { now: () => 0 },
    setTimeout(callback: () => void) { timers.set(++nextTimer, callback); return nextTimer; },
    clearTimeout(id: number) { timers.delete(id); },
    addEventListener(name: string, callback: () => void) { listeners.set(name, callback); },
    removeEventListener(name: string) { listeners.delete(name); },
    MutationObserver: class { constructor(callback: typeof mutationCallback) { mutationCallback = callback; } observe() {} disconnect() { disconnected++; } },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() { disconnected++; } },
    getComputedStyle(element: Element) {
      return { display:'block', visibility:'visible', clipPath:'none', maskImage:'none', borderTopLeftRadius:'24px', borderTopRightRadius:'24px', borderBottomRightRadius:'24px', borderBottomLeftRadius:'24px', backgroundImage: element.dataset.clayRendered ? 'url("data:image/png;base64,AAAA")' : 'linear-gradient(135deg,rgb(255,170,161),rgb(255,129,124))', backgroundColor:'rgba(0,0,0,0)', boxShadow:`${contact}, inset rgb(227, 101, 103) -2px -4px 5px`, getPropertyValue: (name: string) => element.properties.get(name) ?? variables[name] ?? '' };
    },
  };
  const doc = {
    nodeType: 9, defaultView: win,
    head: { appendChild(style: Element) { styles.push(style); } },
    createElement(name: string) { return name === 'canvas' ? { width:0, height:0, getContext:() => context } : new Element(); },
    contains(element: Element) { return elements.includes(element); },
    querySelectorAll() { return elements; },
  };
  elements.forEach(element => element.ownerDocument = doc);
  return {
    doc: doc as unknown as Document, elements, variables, styles, listeners,
    setContact(value: string) { contact = value; },
    mutate(element: Element, attributeName = 'style') { mutationCallback([{ type:'attributes', target:element, attributeName }]); },
    flush() { for (let i = 0; timers.size && i < 100; i++) { const batch = [...timers.values()]; timers.clear(); batch.forEach(callback => callback()); } assert.equal(timers.size, 0); },
    disconnected: () => disconnected,
    queuedTimers: () => timers.size,
  };
}

test('relief shares bitmap cache, ignores motion-only changes and restores DOM on disposal', () => {
  const env = browserHarness();
  const requests: ClayReliefRequest[] = [];
  const runtime = installClayRelief(env.doc, { render(request) { requests.push(request); return 'data:image/png;base64,AAAA'; } });
  env.flush();
  assert.equal(requests.length, 1, 'identical controls reuse one bitmap');
  assert.equal(runtime.stats().cacheHits, 1);
  assert.equal(env.elements[0].dataset.clayRendered, 'true');
  assert.equal(env.elements[0].properties.get('--clay-relief-contact'), 'rgb(100, 70, 130) 2px 5px 8px -3px');
  assert.equal(env.elements[0].offsetWidth, 180, 'native control dimensions are untouched');
  env.elements[0].properties.set('transform', 'translateX(20px) scale(.9)');
  env.mutate(env.elements[0]); env.flush();
  assert.equal(requests.length, 1, 'motion does not re-rasterize');
  runtime.dispose(); runtime.dispose();
  assert.equal(env.disconnected(), 2);
  assert.equal(env.listeners.size, 0);
  assert.equal(env.queuedTimers(), 0);
  assert.ok(env.styles.every(style => style.removed));
  assert.equal(env.elements[0].dataset.clayRendered, undefined);
  assert.equal(env.elements[0].properties.has('--clay-relief-image'), false);
  assert.equal(env.elements[0].properties.get('transform'), 'translateX(20px) scale(.9)');
});

test('material light changes raster once; cast changes reuse it; renderer refusal keeps original material', () => {
  const env = browserHarness(1);
  const requests: ClayReliefRequest[] = [];
  let unavailable = false;
  const runtime = installClayRelief(env.doc, { maxBitmapPixels:4096, render(request) { requests.push(request); return unavailable ? null : 'data:image/png;base64,AAAA'; } });
  env.flush();
  assert.ok(requests[0].width * requests[0].height * requests[0].quality ** 2 <= 4096.01);
  env.variables['--clay-light-x'] = '-1'; env.listeners.get('clay-material-change')!(); env.flush();
  assert.equal(requests.length, 2);
  assert.equal(requests[1].lightX, -1);
  assert.deepEqual(requests[1].face, requests[0].face, 'reads original palette, never last generated image');
  env.setContact('rgb(100, 70, 130) -3px 7px 12px -3px');
  env.listeners.get('clay-material-change')!(); env.flush();
  assert.equal(requests.length, 2, 'softness and external strength are not baked into relief');
  assert.equal(env.elements[0].properties.get('--clay-relief-contact'), 'rgb(100, 70, 130) -3px 7px 12px -3px');
  unavailable = true; env.variables['--clay-volume'] = '1.2'; runtime.refresh(); env.flush();
  assert.equal(env.elements[0].dataset.clayRendered, undefined, 'null renderer retains six-layer CSS fallback');
  assert.equal(env.elements[0].properties.has('--clay-relief-image'), false);
  runtime.dispose();
});

test('own relief palette overrides inline backgrounds without leaking into children or native inputs', () => {
  const env = browserHarness(3);
  env.variables['--clay-relief-face'] = '#dec4ff';
  env.variables['--clay-relief-edge'] = '#bea0eb';
  const child = env.elements[1];
  child.className = ''; child.dataset.clayLayer = 'detail'; child.parentElement = env.elements[0];
  env.elements[2].tagName = 'INPUT';
  const requests: ClayReliefRequest[] = [];
  const runtime = installClayRelief(env.doc, { render(request) { requests.push(request); return 'data:image/png;base64,AAAA'; } });
  env.flush();
  assert.equal(requests.length, 2, 'native input is excluded');
  assert.deepEqual(requests[0].face, [222,196,255]);
  assert.deepEqual(requests[0].edge, [190,160,235]);
  assert.deepEqual(requests[1].face, [255,156,148], 'unpaletted child uses its own gradient instead of inherited lavender');
  child.properties.set('--clay-relief-face', '#b5efda');
  env.mutate(child); env.flush();
  assert.deepEqual(requests[2].face, [181,239,218], 'explicit per-element palette override wins');
  runtime.dispose();
});

test('shape changes independently of physical detail level and gets its own cached bitmap', () => {
  const env = browserHarness(1);
  const element = env.elements[0];
  element.dataset.clayLayer = 'detail';
  const requests: ClayReliefRequest[] = [];
  const runtime = installClayRelief(env.doc, { render(request) { requests.push(request); return 'data:image/png;base64,AAAA'; } });
  env.flush();
  assert.equal(requests[0].layer, 'detail');
  assert.equal(requests[0].shape, 'cushion', 'detail is not an implicit sphere');
  element.dataset.clayShape = 'disc'; env.mutate(element, 'data-clay-shape'); env.flush();
  element.dataset.clayShape = 'sphere'; env.mutate(element, 'data-clay-shape'); env.flush();
  assert.deepEqual(requests.map(request => request.shape), ['cushion','disc','sphere']);
  assert.ok(requests.every(request => request.layer === 'detail'));
  element.dataset.clayShape = 'disc'; env.mutate(element, 'data-clay-shape'); env.flush();
  assert.equal(requests.length, 3, 'previous disc bitmap is reused');
  assert.equal(runtime.stats().cacheHits, 1);
  element.dataset.clayShape = 'invalid'; env.mutate(element, 'data-clay-shape'); env.flush();
  assert.equal(requests.length, 3, 'invalid shape falls back to cached cushion');
  assert.equal(runtime.stats().cacheHits, 2);
  runtime.dispose();
});

test('local depth and specular controls update their own bitmap without leaking into nested details', () => {
  const env = browserHarness(2);
  const outer = env.elements[0], child = env.elements[1];
  child.parentElement = outer; child.dataset.clayLayer = 'detail';
  // The harness supplies equal computed values to parent/child, like inherited
  // CSS variables. Only the outer has authored inline controls initially.
  env.variables['--clay-layer-scale'] = '2';
  env.variables['--clay-relief-specular'] = '.5';
  env.variables['--clay-volume'] = '1.2';
  outer.properties.set('--clay-layer-scale', '2');
  outer.properties.set('--clay-relief-specular', '.5');
  const requests: ClayReliefRequest[] = [];
  const runtime = installClayRelief(env.doc, { render(request) { requests.push(request); return 'data:image/png;base64,AAAA'; } });
  env.flush();
  assert.equal(requests[0].volume, 2.4); assert.equal(requests[0].specularFactor, .5);
  assert.equal(requests[1].volume, 1.2); assert.equal(requests[1].specularFactor, 1);
  const contact = outer.properties.get('--clay-relief-contact');
  outer.properties.set('--clay-relief-specular', '0'); env.mutate(outer); env.flush();
  assert.equal(requests[2].specularFactor, 0);
  assert.equal(outer.properties.get('--clay-relief-contact'), contact, 'highlight intensity never changes the contact shadow');
  child.properties.set('--clay-relief-specular', '4'); env.mutate(child); env.flush();
  assert.equal(requests[3].specularFactor, 2);
  assert.equal(requests[3].volume, 1.2);
  runtime.dispose();
});
