import type { RgbColor } from './types';

export type LabColor = readonly [lightness: number, a: number, b: number];
export type ColorMetric = 'ciede2000' | 'cie76' | 'weighted-rgb';

export function rgbToLab(rgb: RgbColor): LabColor {
  const [r, g, b] = rgb.map((channel) => {
    const value = Math.max(0, Math.min(255, channel)) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) / 1;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;
  const pivot = (value: number) => value > 216 / 24389 ? Math.cbrt(value) : (24389 / 27 * value + 16) / 116;
  const fx = pivot(x);
  const fy = pivot(y);
  const fz = pivot(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function colorDistance(a: RgbColor, b: RgbColor, metric: ColorMetric = 'ciede2000'): number {
  if (metric === 'weighted-rgb') {
    const redMean = (a[0] + b[0]) / 2;
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt((2 + redMean / 256) * dr ** 2 + 4 * dg ** 2 + (2 + (255 - redMean) / 256) * db ** 2);
  }
  const labA = rgbToLab(a);
  const labB = rgbToLab(b);
  return metric === 'cie76'
    ? Math.hypot(labA[0] - labB[0], labA[1] - labB[1], labA[2] - labB[2])
    : deltaE2000(labA, labB);
}

export function deltaE2000(lab1: LabColor, lab2: LabColor): number {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;
  const c1 = Math.hypot(a1, b1);
  const c2 = Math.hypot(a2, b2);
  const cBar = (c1 + c2) / 2;
  const g = 0.5 * (1 - Math.sqrt(cBar ** 7 / (cBar ** 7 + 25 ** 7)));
  const ap1 = (1 + g) * a1;
  const ap2 = (1 + g) * a2;
  const cp1 = Math.hypot(ap1, b1);
  const cp2 = Math.hypot(ap2, b2);
  const hp1 = hueDegrees(b1, ap1);
  const hp2 = hueDegrees(b2, ap2);
  const deltaL = l2 - l1;
  const deltaC = cp2 - cp1;
  const dh = hueDelta(hp1, hp2, cp1, cp2);
  const deltaH = 2 * Math.sqrt(cp1 * cp2) * Math.sin(toRadians(dh / 2));
  const lBar = (l1 + l2) / 2;
  const cpBar = (cp1 + cp2) / 2;
  const hpBar = meanHue(hp1, hp2, cp1, cp2);
  const t = 1 - 0.17 * Math.cos(toRadians(hpBar - 30)) + 0.24 * Math.cos(toRadians(2 * hpBar))
    + 0.32 * Math.cos(toRadians(3 * hpBar + 6)) - 0.2 * Math.cos(toRadians(4 * hpBar - 63));
  const sl = 1 + (0.015 * (lBar - 50) ** 2) / Math.sqrt(20 + (lBar - 50) ** 2);
  const sc = 1 + 0.045 * cpBar;
  const sh = 1 + 0.015 * cpBar * t;
  const rotation = 30 * Math.exp(-(((hpBar - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(cpBar ** 7 / (cpBar ** 7 + 25 ** 7));
  const rt = -rc * Math.sin(toRadians(2 * rotation));
  const dl = deltaL / sl;
  const dc = deltaC / sc;
  const dH = deltaH / sh;
  return Math.sqrt(dl ** 2 + dc ** 2 + dH ** 2 + rt * dc * dH);
}

function hueDegrees(b: number, a: number): number {
  if (a === 0 && b === 0) return 0;
  const value = Math.atan2(b, a) * 180 / Math.PI;
  return value < 0 ? value + 360 : value;
}

function hueDelta(h1: number, h2: number, c1: number, c2: number): number {
  if (c1 * c2 === 0) return 0;
  const delta = h2 - h1;
  if (Math.abs(delta) <= 180) return delta;
  return delta > 180 ? delta - 360 : delta + 360;
}

function meanHue(h1: number, h2: number, c1: number, c2: number): number {
  if (c1 * c2 === 0) return h1 + h2;
  if (Math.abs(h1 - h2) <= 180) return (h1 + h2) / 2;
  return h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
}

function toRadians(value: number): number {
  return value * Math.PI / 180;
}

