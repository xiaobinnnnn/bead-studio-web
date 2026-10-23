import type { BeadGrid } from './types';

export interface ColorUsage {
  colorId: string;
  count: number;
}

export function summarizeGrid(grid: BeadGrid): { total: number; empty: number; colors: ColorUsage[] } {
  const counts = new Map<string, number>();
  let empty = 0;
  for (const cell of grid.cells) {
    if (!cell.colorId) {
      empty += 1;
      continue;
    }
    counts.set(cell.colorId, (counts.get(cell.colorId) ?? 0) + 1);
  }
  const colors = [...counts.entries()]
    .map(([colorId, count]) => ({ colorId, count }))
    .sort((a, b) => b.count - a.count || a.colorId.localeCompare(b.colorId));
  return { total: grid.cells.length - empty, empty, colors };
}

export function assertStatisticsInvariant(grid: BeadGrid): void {
  const summary = summarizeGrid(grid);
  const colorTotal = summary.colors.reduce((sum, row) => sum + row.count, 0);
  if (colorTotal !== summary.total || summary.total + summary.empty !== grid.width * grid.height) {
    throw new Error('Grid statistics invariant failed.');
  }
}

