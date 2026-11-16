import type { ClayReliefRequest } from './clayReliefRenderer';

/** Background-only relief. The renderer is injected; installing is always explicit. */
export type ClayReliefRenderer = (request: ClayReliefRequest) => string | null;
export interface ClayReliefOptions {
  render: ClayReliefRenderer;
  /** Optional additional known, raised surfaces. Never selects arbitrary buttons. */
  selector?: string;
  maxCacheBytes?: number;
  maxCacheEntries?: number;
  maxBitmapPixels?: number;
  maxDeviceScale?: number;
  batchBudgetMs?: number;
  /** Failure leaves the original CSS material intact. */
  onError?: (error: unknown, element: HTMLElement) => void;
}
export interface ClayReliefController {
  refresh: () => void;
  dispose: () => void;
  stats: () => { tracked: number; queued: number; cached: number; cacheBytes: number; rendered: number; cacheHits: number };
}

/** Shared by the live installer and standalone CSS exports. */
export const CLAY_RELIEF_CSS = `[data-clay-rendered="true"] {
  background-image:var(--clay-texture-image,none),var(--clay-relief-image)!important;
  background-size:256px 256px,100% 100%!important;
  background-repeat:repeat,no-repeat!important;
  background-blend-mode:soft-light,normal!important;
  box-shadow:var(--clay-relief-contact,none)!important;
}
[data-clay-rendered="true"][data-clay-relief-role="detail"] {
  background-image:var(--clay-relief-image)!important;
  background-size:100% 100%!important;
  background-repeat:no-repeat!important;
  background-blend-mode:normal!important;
}
[data-clay-rendered="true"]:is(button,[role="button"]):active {
  box-shadow:var(--clay-relief-pressed-contact,
    calc(.5px * var(--clay-volume,1) * var(--clay-light-x,1))
    calc(1px * var(--clay-volume,1) * var(--clay-light-y,1))
    calc(2px * var(--clay-volume,1) * var(--clay-shadow-softness,1))
    rgba(var(--clay-relief-shadow-rgb,var(--clay-shadow,var(--surface-shadow,100,79,119))),calc(.2 * var(--clay-shadow-strength,1))))!important;
}`;

/**
 * No framework, observer polyfill, frame loop, wrappers, or global positioning.
 * Runtime helpers live inside the installer. Embed this module (including its
 * CSS constant) alongside a renderer in a standalone HTML/React export.
 */
export function installClayRelief(root: Document | HTMLElement | ShadowRoot, options: ClayReliefOptions): ClayReliefController {
  const doc = root.nodeType === 9 ? root as Document : root.ownerDocument!;
  const win = doc.defaultView!;
  const selector = options.selector ?? '[data-clay-layer],.ref-surface,.clay-layer-foundation,.clay-layer-control,.clay-layer-detail,.clay-board,.clay-card-cream,.clay-card-lavender,.clay-card-peach,.clay-card-butter,.clay-card-sky,.clay-sidebar-purple,.clay-btn-purple,.clay-btn-rose,.dashboard-sidebar,.studio-header,.dashboard-profile-avatar';
  const defaults = {
    foundation: { bevelWidth: 20, rise: 10, faceTopMix: .8 },
    control: { bevelWidth: 10, rise: 5.5, faceTopMix: .7 },
    detail: { bevelWidth: 6, rise: 3, faceTopMix: .65 },
  };
  const maxCacheBytes = Math.max(1_048_576, options.maxCacheBytes ?? 16_777_216);
  const maxCacheEntries = Math.max(1, options.maxCacheEntries ?? 64);
  const maxPixels = Math.max(4096, options.maxBitmapPixels ?? 250_000);
  const maxScale = Math.max(.25, Math.min(2, options.maxDeviceScale ?? 1.5));
  const budget = Math.max(1, options.batchBudgetMs ?? 7);
  const queue = new Set<HTMLElement>();
  const cache = new Map<string, { image: string; bytes: number }>();
  const tracked = new Map<HTMLElement, { signature: string; key: string; width?: number; height?: number; originalImage: string; originalRendered: string | null; originalRole: string | null; originalShadow: string }>();
  let cacheBytes = 0, rendered = 0, cacheHits = 0, timer = 0, disposed = false;
  const colorCanvas = doc.createElement('canvas');
  colorCanvas.width = colorCanvas.height = 1;
  const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map<string, [number, number, number] | null>();
  const style = doc.createElement('style');
  style.dataset.clayReliefRuntime = 'true';
  style.textContent = CLAY_RELIEF_CSS;
  (root.nodeType === 11 ? root : doc.head).appendChild(style);

  const finite = (text: string, fallback: number) => Number.isFinite(parseFloat(text)) ? parseFloat(text) : fallback;
  const round = (n: number) => Math.round(n * 100) / 100;
  function layers(value: string): string[] {
    let depth = 0, start = 0;
    const result: string[] = [];
    for (let i = 0; i < value.length; i++) {
      if (value[i] === '(') depth++;
      else if (value[i] === ')') depth--;
      else if (value[i] === ',' && depth === 0) { result.push(value.slice(start, i).trim()); start = i + 1; }
    }
    result.push(value.slice(start).trim());
    return result;
  }
  function color(value: string, allowAlpha = false): [number, number, number] | null {
    if (!value || !colorContext) return null;
    const key = `${allowAlpha}:${value}`;
    if (colorCache.has(key)) return colorCache.get(key)!;
    colorContext.clearRect(0, 0, 1, 1);
    colorContext.fillStyle = '#010203';
    colorContext.fillStyle = value;
    if (colorContext.fillStyle === '#010203' && !/^#010203$/i.test(value)) return null;
    colorContext.fillRect(0, 0, 1, 1);
    const pixel = colorContext.getImageData(0, 0, 1, 1).data;
    const result: [number, number, number] | null = pixel[3] >= (allowAlpha ? 8 : 245) ? [pixel[0], pixel[1], pixel[2]] : null;
    if (colorCache.size > 128) colorCache.clear();
    colorCache.set(key, result);
    return result;
  }
  function inlineSignature(element: HTMLElement): string {
    // Motion writes transform/left/opacity every frame; those do not change relief.
    return [element.className, element.hidden, element.dataset.clayLayer, element.dataset.clayShape, element.dataset.claySurface, element.dataset.clayRelief,
      ...['background','background-image','background-color','border-radius','display','visibility','box-shadow','--clay-top','--clay-bottom','--clay-face','--clay-edge','--clay-relief-face','--clay-relief-edge','--surface-top','--surface-bottom','--surface-face','--surface-edge','--clay-volume','--clay-layer-scale','--clay-relief-specular','--clay-light-x','--clay-light-y','--clay-bevel-width','--clay-rise','--clay-face-top-mix'].map(name => element.style.getPropertyValue(name))].join('|');
  }
  function eligible(element: Element): element is HTMLElement {
    if (element.namespaceURI !== 'http://www.w3.org/1999/xhtml' || /^(IMG|CANVAS|VIDEO|PICTURE|IFRAME|SCRIPT|STYLE|INPUT|TEXTAREA|SELECT)$/.test(element.tagName)) return false;
    if (!element.matches(selector) || element.getAttribute('data-clay-surface') === 'recessed' || element.getAttribute('data-clay-relief') === 'off') return false;
    if (element.getAttribute('data-clay-layer') === 'detail' && (element.hasAttribute('data-clay-text') || element.classList.contains('clay-detail-text'))) return false;
    return !element.closest('svg,[data-clay-relief="off"]');
  }
  function restore(element: HTMLElement) {
    const state = tracked.get(element);
    if (!state) return;
    state.originalImage ? element.style.setProperty('--clay-relief-image', state.originalImage) : element.style.removeProperty('--clay-relief-image');
    state.originalShadow ? element.style.setProperty('--clay-relief-contact', state.originalShadow) : element.style.removeProperty('--clay-relief-contact');
    state.originalRendered === null ? element.removeAttribute('data-clay-rendered') : element.setAttribute('data-clay-rendered', state.originalRendered);
    state.originalRole === null ? element.removeAttribute('data-clay-relief-role') : element.setAttribute('data-clay-relief-role', state.originalRole);
  }
  function drop(element: HTMLElement) {
    restore(element); tracked.delete(element); queue.delete(element); resize?.unobserve(element);
  }
  function enqueue(element: HTMLElement) {
    if (disposed) return;
    queue.add(element);
    if (!timer) timer = win.setTimeout(flush, 16);
  }
  function track(element: Element) {
    if (!eligible(element) || tracked.has(element)) return;
    tracked.set(element, { signature: inlineSignature(element), key: '', originalImage: element.style.getPropertyValue('--clay-relief-image'), originalRendered: element.getAttribute('data-clay-rendered'), originalRole: element.getAttribute('data-clay-relief-role'), originalShadow: element.style.getPropertyValue('--clay-relief-contact') });
    resize?.observe(element, { box: 'border-box' });
    enqueue(element);
  }
  function scan(node: ParentNode) {
    if (node instanceof win.Element) track(node);
    node.querySelectorAll(selector).forEach(track);
  }
  function requestFor(element: HTMLElement): { request: ClayReliefRequest; contact: string } | null {
    const state = tracked.get(element)!;
    const width = round(state.width ?? element.offsetWidth), height = round(state.height ?? element.offsetHeight);
    if (width < 2 || height < 2) return null;
    // Read original material under the adapter, without changing layout or content.
    const marker = element.getAttribute('data-clay-rendered');
    element.removeAttribute('data-clay-rendered');
    try {
      const css = win.getComputedStyle(element);
      if (css.display === 'none' || css.visibility === 'hidden' || css.clipPath !== 'none' || (css.maskImage && css.maskImage !== 'none')) return null;
      const role = (['foundation','control','detail'].includes(element.dataset.clayLayer ?? '') ? element.dataset.clayLayer : element.matches('.clay-layer-detail') ? 'detail' : element.matches('.clay-layer-foundation,.clay-board,.clay-card-cream,.clay-card-lavender,.clay-card-peach,.clay-card-butter,.clay-card-sky,.clay-sidebar-purple,.dashboard-sidebar,.studio-header') ? 'foundation' : 'control') as ClayReliefRequest['layer'];
      // Shape is authored on this surface, never inferred from detail level or parent.
      const shape = element.dataset.clayShape === 'sphere' ? 'sphere' : element.dataset.clayShape === 'disc' ? 'disc' : 'cushion';
      const profile = defaults[role];
      const value = (name: string, fallback: number) => finite(css.getPropertyValue(name), fallback);
      let parentStyle: CSSStyleDeclaration | null | undefined;
      const inheritedValue = (name: string) => {
        if (parentStyle === undefined) parentStyle = element.parentElement ? win.getComputedStyle(element.parentElement) : null;
        return parentStyle?.getPropertyValue(name).trim() ?? '';
      };
      const localValue = (name: string, fallback: number) => {
        const inline = element.style.getPropertyValue(name).trim();
        if (inline) return finite(inline, fallback);
        const token = css.getPropertyValue(name).trim();
        // Per-object generator controls must not leak into nested objects. An
        // authored physical profile can reset scale even when its value matches.
        const ownProfile = name === '--clay-layer-scale' && css.getPropertyValue('--clay-layer-level').trim() !== inheritedValue('--clay-layer-level');
        return token && (ownProfile || token !== inheritedValue(name)) ? finite(token, fallback) : fallback;
      };
      const radiusValue = (text: string) => {
        const [rx, ry = rx] = text.split(' ');
        const x = rx.includes('%') ? width * parseFloat(rx) / 100 : finite(rx, 0);
        const y = ry.includes('%') ? height * parseFloat(ry) / 100 : finite(ry, 0);
        const half = Math.min(width, height) / 2;
        return [Math.min(rx.includes('%') ? width / 2 : half, x), Math.min(ry.includes('%') ? height / 2 : half, y)];
      };
      const corners = [css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomRightRadius, css.borderBottomLeftRadius].map(radiusValue);
      // The current renderer is a uniform rounded rectangle. Preserve unsupported shapes.
      const radius = Math.min(...corners.flat());
      if (corners.flat().some(n => Math.abs(n - radius) > .6)) return null;
      const source = css.backgroundImage;
      // Approved grain is retained separately; never paint over photographic assets.
      if (layers(source).some(layer => /^url\(/.test(layer) && !/feTurbulence/.test(layer))) return null;
      const gradient = layers(source).filter(layer => /^(linear|radial)-gradient\(/.test(layer)).at(-1);
      if (/url\(/.test(source) && !gradient) return null;
      const colorPattern = /#[\da-f]{3,8}\b|rgba?\([^)]*\)|color\([^)]*\)/gi;
      const stops = gradient?.match(colorPattern)?.map(value => color(value)).filter((c): c is [number, number, number] => c !== null) ?? [];
      const prefix = element.matches('.ref-surface') ? '--clay-' : '--surface-';
      const hasInlineBackground = Boolean(element.style.background || element.style.backgroundImage || element.style.backgroundColor);
      const ownsPalette = element.matches('.ref-surface,.clay-board,.clay-card-cream,.clay-card-lavender,.clay-card-peach,.clay-card-butter,.clay-card-sky,.clay-sidebar-purple,.clay-btn-purple,.clay-btn-rose');
      const ownToken = (name: string) => {
        const token = css.getPropertyValue(name).trim();
        if (!token) return '';
        if (element.style.getPropertyValue(name).trim() || ownsPalette) return token;
        // Unstyled role wrappers and inline controls must not borrow a parent's pigment.
        return token !== inheritedValue(name) ? token : '';
      };
      const top = (element.matches('.ref-surface') || !hasInlineBackground ? color(ownToken(prefix + 'top')) : null) ?? stops[0] ?? color(css.backgroundColor);
      const bottom = (element.matches('.ref-surface') || !hasInlineBackground ? color(ownToken(prefix + 'bottom')) : null) ?? stops.at(-1) ?? top;
      if (!top || !bottom) return null;
      const mix = Math.max(0, Math.min(1, value('--clay-face-top-mix', profile.faceTopMix)));
      const base = color(ownToken('--clay-relief-face')) ?? (element.matches('.ref-surface') || !hasInlineBackground ? color(ownToken(prefix + 'face')) : null) ?? top.map((channel, i) => Math.round(channel * mix + bottom[i] * (1 - mix))) as [number, number, number];
      const shadowLayers = layers(css.boxShadow);
      const darkInset = shadowLayers.filter(layer => /\binset\b/.test(layer)).at(-1)?.match(colorPattern)?.[0];
      const edge = color(ownToken('--clay-relief-edge')) ?? (element.matches('.ref-surface') || !hasInlineBackground ? color(ownToken(prefix + 'edge')) : null) ?? (darkInset ? color(darkInset, true) : null) ?? bottom;
      const deviceScale = Math.min(maxScale, win.devicePixelRatio || 1, Math.sqrt(maxPixels / (width * height)));
      return { request: { width, height, radius, layer: role, shape, face: base, edge, lightX: value('--clay-light-x', 1), lightY: value('--clay-light-y', 1), volume: Math.max(.1, Math.min(3, value('--clay-volume', 1) * localValue('--clay-layer-scale', 1))), specularFactor: Math.max(0, Math.min(2, localValue('--clay-relief-specular', 1))), quality: deviceScale, bevelWidth: value('--clay-bevel-width', profile.bevelWidth), rise: value('--clay-rise', profile.rise) }, contact: shadowLayers.filter(layer => !/\binset\b/.test(layer)).join(', ') || 'none' };
    } finally {
      if (marker !== null) element.setAttribute('data-clay-rendered', marker);
    }
  }
  function paint(element: HTMLElement) {
    if (!root.contains(element) || !eligible(element)) { drop(element); return; }
    const state = tracked.get(element)!;
    const result = requestFor(element);
    if (!result) { restore(element); state.key = ''; return; }
    const key = JSON.stringify(result.request);
    // Contact/shadow strength is independent of the raster, so it is never baked in.
    element.style.setProperty('--clay-relief-contact', result.contact);
    if (state.key === key) return;
    let entry = cache.get(key);
    if (entry) { cache.delete(key); cache.set(key, entry); cacheHits++; }
    else {
      const image = options.render(result.request);
      if (!image) { restore(element); state.key = ''; return; }
      if (!/^data:image\/(png|webp);/i.test(image)) throw new Error('Clay relief renderer must return a PNG or WebP data URL.');
      const pixels = Math.ceil(result.request.width * result.request.quality) * Math.ceil(result.request.height * result.request.quality);
      entry = { image, bytes: pixels * 4 + image.length * 2 };
      if (entry.bytes <= maxCacheBytes) { cache.set(key, entry); cacheBytes += entry.bytes; }
      rendered++;
      while (cacheBytes > maxCacheBytes || cache.size > maxCacheEntries) {
        const oldest = cache.keys().next().value!;
        cacheBytes -= cache.get(oldest)!.bytes; cache.delete(oldest);
      }
    }
    element.style.setProperty('--clay-relief-image', `url("${entry.image}")`);
    element.dataset.clayReliefRole = result.request.layer;
    element.dataset.clayRendered = 'true';
    state.key = key;
  }
  function flush() {
    timer = 0;
    if (disposed) return;
    const start = win.performance.now();
    let count = 0;
    for (const element of queue) {
      queue.delete(element);
      try { paint(element); } catch (error) { restore(element); tracked.get(element)!.key = ''; options.onError?.(error, element); }
      if (++count >= 3 || win.performance.now() - start >= budget) break;
    }
    if (queue.size) timer = win.setTimeout(flush, 16);
  }
  const resize = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(entries => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      const state = tracked.get(element);
      if (!state) continue;
      const size = entry.borderBoxSize?.[0];
      const width = round(size?.inlineSize ?? element.offsetWidth), height = round(size?.blockSize ?? element.offsetHeight);
      if (state.width !== width || state.height !== height) { state.width = width; state.height = height; enqueue(element); }
    }
  }) : null;
  const observer = new win.MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList') {
        record.addedNodes.forEach(node => { if (node.nodeType === 1) scan(node as Element); });
        if (record.removedNodes.length) for (const element of tracked.keys()) if (!root.contains(element)) drop(element);
      } else {
        const element = record.target as HTMLElement;
        const state = tracked.get(element);
        if (state) {
          const signature = inlineSignature(element);
          if (signature !== state.signature) { state.signature = signature; enqueue(element); }
        } else if (eligible(element)) track(element);
        if (record.attributeName === 'class') for (const child of tracked.keys()) if (child !== element && element.contains(child)) enqueue(child);
      }
    }
  });
  const refresh = () => { if (!disposed) { scan(root); tracked.forEach((_, element) => enqueue(element)); } };
  observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['style','class','data-clay-layer','data-clay-shape','data-clay-surface','data-clay-relief','hidden'] });
  win.addEventListener('clay-material-change', refresh);
  win.addEventListener('resize', refresh);
  refresh();
  return {
    refresh,
    stats: () => ({ tracked: tracked.size, queued: queue.size, cached: cache.size, cacheBytes, rendered, cacheHits }),
    dispose() {
      if (disposed) return;
      disposed = true;
      win.clearTimeout(timer); observer.disconnect(); resize?.disconnect();
      win.removeEventListener('clay-material-change', refresh); win.removeEventListener('resize', refresh);
      tracked.forEach((_, element) => restore(element)); tracked.clear(); queue.clear(); cache.clear(); colorCache.clear();
      cacheBytes = 0; style.remove();
    },
  };
}
