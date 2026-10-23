import type { BeadGrid, BeadPaletteColor } from './types';

export interface PixelImageData {
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
}

export function createPixelImageData(
  grid: BeadGrid,
  palette: readonly BeadPaletteColor[],
  scale = 1,
): PixelImageData {
  if (!Number.isSafeInteger(scale) || scale < 1 || scale > 64) {
    throw new RangeError(`Pixel scale must be an integer from 1 to 64; received ${scale}.`);
  }
  if (grid.cells.length !== grid.width * grid.height) throw new Error('Grid cell count does not match its dimensions.');
  const colors = new Map(palette.map((color) => [color.id, color.displayRgb]));
  const width = grid.width * scale;
  const height = grid.height * scale;
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < grid.height; row += 1) {
    for (let column = 0; column < grid.width; column += 1) {
      const cell = grid.cells[row * grid.width + column];
      const rgb = cell.colorId ? colors.get(cell.colorId) : undefined;
      if (cell.colorId && !rgb) throw new Error(`Palette color ${cell.colorId} is missing.`);
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const offset = ((row * scale + dy) * width + column * scale + dx) * 4;
          if (rgb) {
            rgba[offset] = rgb[0];
            rgba[offset + 1] = rgb[1];
            rgba[offset + 2] = rgb[2];
            rgba[offset + 3] = 255;
          }
        }
      }
    }
  }
  return { width, height, rgba };
}

export function isSmartBoard52Profile(grid: BeadGrid): boolean {
  return grid.width === 52 && grid.height === 52;
}

