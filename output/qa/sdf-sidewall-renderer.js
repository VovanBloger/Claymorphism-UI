/* Static study only. Real HTML content stays above a cached, normal-lit background. */
(function () {
  'use strict';
  const palette = {
    lavender: [222, 196, 255], coral: [255, 159, 152], mint: [181, 239, 218],
    sky: [175, 216, 247], cream: [252, 248, 250],
  };
  const edgePalette = {
    lavender: [190, 166, 247], coral: [251, 124, 123], mint: [130, 200, 173],
    sky: [125, 181, 223], cream: [218, 207, 216],
  };
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const unit = v => { const length = Math.hypot(...v); return v.map(n => n / length); };
  const signatures = new WeakMap();

  function distanceAndNormal(x, y, halfWidth, halfHeight, radius) {
    const qx = Math.abs(x) - (halfWidth - radius);
    const qy = Math.abs(y) - (halfHeight - radius);
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    const outside = Math.hypot(ox, oy);
    const sd = outside + Math.min(Math.max(qx, qy), 0) - radius;
    if (outside > 1e-9) return { d: -sd, nx: ox / outside * Math.sign(x), ny: oy / outside * Math.sign(y) };
    return qx > qy ? { d: -sd, nx: Math.sign(x), ny: 0 } : { d: -sd, nx: 0, ny: Math.sign(y) };
  }

  function renderSurface(element, force = false) {
    const box = element.getBoundingClientRect();
    const width = box.width, height = box.height;
    if (!width || !height) return;
    const css = getComputedStyle(element);
    const minimum = Math.min(width, height);
    const radiusValue = css.borderTopLeftRadius.split(' ')[0];
    const radius = Math.min(minimum / 2, radiusValue.includes('%') ? minimum * parseFloat(radiusValue) / 100 : parseFloat(radiusValue) || 0);
    const role = element.dataset.clayLayer || 'control';
    const colorName = Object.keys(palette).find(name => element.classList.contains(name)) || 'cream';
    const color = palette[colorName];
    const edgeColor = edgePalette[colorName];
    const dpr = 1;
    const root = getComputedStyle(document.documentElement);
    const lightX = parseFloat(root.getPropertyValue('--clay-light-x')) || 1;
    const lightY = parseFloat(root.getPropertyValue('--clay-light-y')) || 1;
    const light = unit([-.55 * lightX, -.70 * lightY, 1.25]);
    const half = unit([light[0], light[1], light[2] + 1]);
    const lightXY = unit([light[0], light[1]]);
    const crestSlope = .3197;
    const crestSigma = role === 'foundation' ? .15 : .14;
    const flatCrest = Math.exp(-.5 * Math.pow(crestSlope / crestSigma, 2));
    const nominalWidth = role === 'foundation' ? 20 : 10;
    const bevel = role === 'detail' ? minimum / 2 : Math.max(.5, Math.min(nominalWidth, radius * .65, height * .22));
    const rise = role === 'detail' ? bevel * .5 : (role === 'foundation' ? 10 : 5.5) * bevel / nominalWidth;
    const signature = [width, height, radius, role, color.join(','), dpr, lightX, lightY].join('|');
    if (!force && signatures.get(element) === signature) return;

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    const context = canvas.getContext('2d');
    const image = context.createImageData(canvas.width, canvas.height);
    const flatBroad = Math.pow(half[2], 12), flatCore = Math.pow(half[2], 80);
    for (let py = 0; py < canvas.height; py++) {
      for (let px = 0; px < canvas.width; px++) {
        const original = distanceAndNormal((px + .5) / dpr - width / 2, (py + .5) / dpr - height / 2, width / 2, height / 2, radius);
        const tx = role === 'foundation' ? 3 : role === 'detail' ? 0 : 1.5;
        const ty = role === 'foundation' ? 6 : role === 'detail' ? 0 : 3;
        const p = distanceAndNormal((px + .5) / dpr - (width-tx) / 2, (py + .5) / dpr - (height-ty) / 2, (width-tx) / 2, (height-ty) / 2, Math.min(radius,(height-ty)/2,(width-tx)/2));
        const alpha = clamp(original.d + .5);
        if (!alpha) continue;
        const u = clamp(p.d / bevel);
        const slope = u >= 1 ? 0 : (rise / bevel) * (1 - u) / Math.sqrt(Math.max(1e-8, 2 * u - u * u));
        const invLength = 1 / Math.sqrt(1 + slope * slope);
        const nx = p.nx * slope * invLength, ny = p.ny * slope * invLength, nz = invLength;
        const diffuse = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
        const nh = Math.max(0, nx * half[0] + ny * half[1] + nz * half[2]);
        const bodyShade = clamp(1 - diffuse / light[2]);
        const bodyLift = clamp(diffuse / light[2] - 1, 0, .05);
        // Art-directed extended-softbox approximation, not an exact area-light BRDF:
        // a slope-space Gaussian spreads the crest over both lit shoulders while
        // keeping its distance from the outline tied to the elliptical profile.
        // Subtract the flat response so the central face retains its measured color.
        const crest = Math.max(0, (Math.exp(-.5 * Math.pow((slope - crestSlope) / crestSigma, 2)) - flatCrest) / (1 - flatCrest));
        const shoulderLight = Math.sqrt(Math.max(0, p.nx * lightXY[0] + p.ny * lightXY[1]));
        const specular = role === 'detail'
          ? clamp(.12 * (Math.pow(nh, 12) - flatBroad) + .78 * (Math.pow(nh, 80) - flatCore))
          : clamp(.72 * crest * shoulderLight);
        const index = (py * canvas.width + px) * 4;
        for (let channel = 0; channel < 3; channel++) {
          const shadedBody = color[channel] + (edgeColor[channel] - color[channel]) * bodyShade;
          const body = shadedBody + (255 - shadedBody) * bodyLift;
          image.data[index + channel] = clamp(body + (255 - body) * specular, 0, 255);
        }
        image.data[index + 3] = Math.round(alpha * 255);
      }
    }
    context.putImageData(image, 0, 0);
    element.style.setProperty('--sdf-image', `url("${canvas.toDataURL('image/png')}")`);
    element.dataset.sdfReady = 'true';
    element.dataset.sdfProfile = `w=${bevel.toFixed(2)};H=${rise.toFixed(2)};r=${radius.toFixed(2)};dpr=${dpr}`;
    signatures.set(element, signature);
  }

  function renderAll(force = false) {
    const start = performance.now();
    const elements = [...document.querySelectorAll('.sdf .study-surface')];
    elements.forEach(element => renderSurface(element, force));
    window.ClaySDF.lastRender = { count: elements.length, elapsedMs: performance.now() - start };
  }
  window.ClaySDF = { renderAll, renderSurface, distanceAndNormal, palette, edgePalette, lastRender: null };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => renderAll(), { once: true });
  else renderAll();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => renderAll(), 100); });
  window.addEventListener('clay-material-change', () => renderAll());
})();
