/** Convert existing clay materials to shared lighting tokens without changing layout. */
function splitOutsideFunctions(value: string, separator: ',' | ' '): string[] {
  const parts: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++;
    else if (value[i] === ')') depth--;
    else if (depth === 0 && (separator === ',' ? value[i] === ',' : /\s/.test(value[i]))) {
      if (value.slice(start, i).trim()) parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (value.slice(start).trim()) parts.push(value.slice(start).trim());
  return parts;
}

function shadowColor(color: string): string {
  const rgba = color.match(/^rgba?\((.*)\)$/i);
  if (rgba) {
    const parts = splitOutsideFunctions(rgba[1], ',');
    if (parts.length === 4 || (parts.length === 2 && parts[0].startsWith('var('))) {
      const alpha = parts.pop()!;
      if (/^[\d.]+$/.test(alpha)) return `rgba(${parts.join(', ')}, calc(${alpha} * var(--clay-shadow-strength, 1)))`;
    }
    if (parts.length === 3) return `rgba(${parts.join(', ')}, var(--clay-shadow-strength, 1))`;
    const modern = rgba[1].match(/^(.*)\s*\/\s*([\d.]+)$/);
    if (modern) return `rgb(${modern[1].trim()} / calc(${modern[2]} * var(--clay-shadow-strength, 1)))`;
  }
  const hex = color.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (hex && [3, 4, 6, 8].includes(hex.length)) {
    const expanded = hex.length <= 4 ? [...hex].map(c => c + c).join('') : hex;
    const rgb = [0, 2, 4].map(i => parseInt(expanded.slice(i, i + 2), 16));
    const alpha = expanded.length === 8 ? Number((parseInt(expanded.slice(6), 16) / 255).toFixed(5)) : 1;
    return `rgba(${rgb.join(', ')}, calc(${alpha} * var(--clay-shadow-strength, 1)))`;
  }
  return color;
}

function shadowLayer(layer: string): string {
  // Preserve already converted layers, even when adjacent layers are still static.
  if (layer.includes('--clay-volume') || layer.includes('--clay-light-') || layer === 'none') return layer;
  const tokens = splitOutsideFunctions(layer, ' ');
  const inset = tokens.includes('inset');
  let lengthIndex = 0;
  return tokens.map(token => {
    if (/^-?(?:\d*\.)?\d+(?:px|rem|em)$/.test(token) || token === '0') {
      const value = token === '0' ? '0px' : token;
      const index = lengthIndex++;
      if (index < 2) return `calc(${value} * var(--clay-volume, 1) * var(--clay-light-${index === 0 ? 'x' : 'y'}, 1))`;
      if (index === 2) return `calc(${value} * var(--clay-volume, 1) * var(--clay-shadow-softness, 1))`;
      return `calc(${value} * var(--clay-volume, 1))`;
    }
    return inset ? token : shadowColor(token);
  }).join(' ');
}

export function materialShadow(value: string): string {
  return splitOutsideFunctions(value, ',').map(shadowLayer).join(', ');
}

export function materialBackground(value: string): string {
  const linear = value.replace(/((?:repeating-)?linear-gradient\()(-?[\d.]+)deg\s*,/gi, (_, prefix: string, angle: string) => {
    const adjustment = Number(angle) - 135;
    return `${prefix}calc(var(--clay-light-angle, 135deg) ${adjustment < 0 ? '-' : '+'} ${Math.abs(adjustment)}deg),`;
  });
  // Sphere highlights may be tinted. Elliptical decorative fields (the cosmos) stay fixed.
  return linear.replace(/(radial-gradient\(circle\s+at\s+)([\d.]+)%\s+([\d.]+)%(?=\s*,)/gi, (_, prefix: string, x: string, y: string) => {
    const coordinate = (percent: string, axis: string) => `calc(${percent}% + var(--clay-light-origin-${axis}, 0%) * ${(1 - 2 * Number(percent) / 100).toFixed(4)})`;
    return `${prefix}${coordinate(x, 'x')} ${coordinate(y, 'y')}`;
  });
}

export function materialFilter(value: string): string {
  // Find balanced drop-shadow() calls; rgba() and calc() contain nested brackets.
  let result = '', cursor = 0;
  const expression = /drop-shadow\(/g;
  let match: RegExpExecArray | null;
  while ((match = expression.exec(value))) {
    const start = match.index + match[0].length;
    let end = start, depth = 1;
    while (end < value.length && depth) {
      if (value[end] === '(') depth++;
      if (value[end] === ')') depth--;
      end++;
    }
    if (depth) break;
    result += value.slice(cursor, start) + shadowLayer(value.slice(start, end - 1)) + ')';
    cursor = end;
    expression.lastIndex = end;
  }
  return result + value.slice(cursor);
}

/** Generated stylesheets use only these declarations; keep geometry and keyframes intact. */
export function materialStylesheet(value: string): string {
  return value.replace(/\b(box-shadow|background|filter)\s*:\s*([^;{}]+);/g, (_, property: string, content: string) => {
    const convert = property === 'box-shadow' ? materialShadow : property === 'filter' ? materialFilter : materialBackground;
    return `${property}: ${convert(content.trim())};`;
  });
}
