import type { BeadCell, BeadGrid, CellSource } from './types';

export function createGrid(width: number, height: number, source: CellSource = 'manual'): BeadGrid {
  assertGridDimensions(width, height);
  return {
    width,
    height,
    cells: Array.from({ length: width * height }, (_, index) => ({
      row: Math.floor(index / width),
      column: index % width,
      colorId: null,
      confirmed: source === 'manual',
      source,
    })),
  };
}

export function normalizeGrid(grid: BeadGrid): BeadGrid {
  assertGridDimensions(grid.width, grid.height);
  const expected = grid.width * grid.height;
  if (!Array.isArray(grid.cells) || grid.cells.length !== expected) {
    throw new Error(`Grid contains ${grid.cells?.length ?? 0} cells; expected ${expected}.`);
  }
  return {
    width: grid.width,
    height: grid.height,
    cells: grid.cells.map((cell, index) => normalizeCell(cell, index, grid.width)),
  };
}

export function replaceCell(grid: BeadGrid, row: number, column: number, patch: Partial<BeadCell>): BeadGrid {
  const normalized = normalizeGrid(grid);
  if (row < 0 || row >= grid.height || column < 0 || column >= grid.width) {
    throw new RangeError(`Cell (${row}, ${column}) is outside ${grid.width}x${grid.height}.`);
  }
  const index = row * grid.width + column;
  const cells = normalized.cells.slice();
  cells[index] = normalizeCell({ ...cells[index], ...patch, row, column }, index, grid.width);
  return { ...normalized, cells };
}

function normalizeCell(cell: BeadCell, index: number, width: number): BeadCell {
  const confidence = cell.confidence;
  if (confidence !== undefined && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) {
    throw new RangeError(`Cell confidence must be between 0 and 1; received ${confidence}.`);
  }
  return {
    ...cell,
    row: Math.floor(index / width),
    column: index % width,
    colorId: cell.colorId ?? null,
    confirmed: Boolean(cell.confirmed),
    source: cell.source ?? 'manual',
  };
}

function assertGridDimensions(width: number, height: number): void {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) {
    throw new RangeError(`Grid dimensions must be positive integers; received ${width}x${height}.`);
  }
  if (width * height > 1_000_000) throw new RangeError('Grid exceeds the one-million-cell safety limit.');
}

