import assert from 'node:assert/strict';
import test from 'node:test';
import { deltaE2000 } from '../src/core/color.ts';
import { createGrid, replaceCell } from '../src/core/grid.ts';
import { createPixelImageData } from '../src/core/pixelExport.ts';
import { migrateProject, parseProjectJson, serializeProject } from '../src/core/project.ts';
import { assertStatisticsInvariant, summarizeGrid } from '../src/core/statistics.ts';

test('CIEDE2000 matches the published Sharma reference pair', () => {
  const distance = deltaE2000([50, 2.6772, -79.7751], [50, 0, -82.7485]);
  assert.ok(Math.abs(distance - 2.0425) < 0.0001);
});

test('editing one cell updates statistics without breaking the total invariant', () => {
  let grid = createGrid(2, 2);
  grid = replaceCell(grid, 0, 0, { colorId: 'MARD:A1' });
  grid = replaceCell(grid, 0, 1, { colorId: 'MARD:A1' });
  grid = replaceCell(grid, 1, 0, { colorId: 'MARD:B1' });
  assert.deepEqual(summarizeGrid(grid), {
    total: 3,
    empty: 1,
    colors: [{ colorId: 'MARD:A1', count: 2 }, { colorId: 'MARD:B1', count: 1 }],
  });
  assert.doesNotThrow(() => assertStatisticsInvariant(grid));
});

test('legacy v1 JSON migrates and round-trips without changing the grid', () => {
  const migrated = migrateProject({
    version: '1.0.0', name: 'Legacy', width: 2, height: 1,
    paletteVersion: 'mard-291-v1', cells: ['MARD:A1', null],
  });
  const restored = parseProjectJson(serializeProject(migrated));
  assert.equal(restored.schemaVersion, '2.0.0');
  assert.deepEqual(restored.grid, migrated.grid);
});

test('pixel export is one grid per pixel and only integer-nearest-neighbour duplication', () => {
  let grid = createGrid(2, 1);
  grid = replaceCell(grid, 0, 0, { colorId: 'red' });
  const palette = [{ id: 'red', brand: 'MARD' as const, code: 'A1', displayRgb: [255, 0, 0] as const }];
  const native = createPixelImageData(grid, palette);
  assert.equal(native.width, 2);
  assert.deepEqual([...native.rgba], [255, 0, 0, 255, 0, 0, 0, 0]);
  const doubled = createPixelImageData(grid, palette, 2);
  assert.equal(doubled.width, 4);
  assert.equal(doubled.height, 2);
  assert.deepEqual([...doubled.rgba.slice(0, 16)], [255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0]);
});

