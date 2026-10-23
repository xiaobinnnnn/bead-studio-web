import type { BeadCell, BeadProject } from './types';

const DEFAULT_IMAGE_TRANSFORM = {
  fit: 'contain' as const,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
};

export interface LegacyProjectV1 {
  version?: string;
  name?: string;
  width: number;
  height: number;
  activeBrand?: string;
  paletteVersion?: string;
  cells: Array<string | null>;
  createdAt?: string;
  updatedAt?: string;
}

export function createProject(width = 52, height = 52, name = '未命名图纸'): BeadProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: '2.0.0',
    id: createProjectId(),
    name,
    grid: createProjectGrid(width, height),
    palette: { id: 'mard-291', brand: 'MARD', version: 'mard-291-v1', calibrated: false },
    imageTransform: { ...DEFAULT_IMAGE_TRANSFORM },
    createdAt: now,
    updatedAt: now,
  };
}

export function parseProjectJson(json: string): BeadProject {
  return migrateProject(JSON.parse(json) as unknown);
}

export function serializeProject(project: BeadProject): string {
  const normalized = normalizeProject(project);
  return JSON.stringify(normalized, null, 2);
}

export function migrateProject(input: unknown): BeadProject {
  if (!input || typeof input !== 'object') throw new Error('Project file must contain a JSON object.');
  const candidate = input as Partial<BeadProject> & Partial<LegacyProjectV1>;
  if (candidate.schemaVersion === '2.0.0' && candidate.grid) return normalizeProject(candidate as BeadProject);
  if (Number.isSafeInteger(candidate.width) && Number.isSafeInteger(candidate.height) && Array.isArray(candidate.cells)) {
    return migrateV1(candidate as LegacyProjectV1);
  }
  throw new Error(`Unsupported project schema: ${candidate.schemaVersion ?? candidate.version ?? 'unknown'}.`);
}

export function normalizeProject(project: BeadProject): BeadProject {
  const grid = normalizeProjectGrid(project.grid);
  const createdAt = validDate(project.createdAt) ? project.createdAt : new Date().toISOString();
  return {
    ...project,
    schemaVersion: '2.0.0',
    id: project.id || createProjectId(),
    name: project.name?.trim() || '未命名图纸',
    grid,
    palette: {
      id: project.palette?.id || 'mard-291',
      brand: project.palette?.brand || 'MARD',
      version: project.palette?.version || 'unknown',
      calibrated: Boolean(project.palette?.calibrated),
    },
    imageTransform: { ...DEFAULT_IMAGE_TRANSFORM, ...project.imageTransform },
    createdAt,
    updatedAt: validDate(project.updatedAt) ? project.updatedAt : createdAt,
  };
}

function migrateV1(project: LegacyProjectV1): BeadProject {
  const base = createProject(project.width, project.height, project.name || '导入图纸');
  if (project.cells.length !== project.width * project.height) {
    throw new Error(`Legacy grid contains ${project.cells.length} cells; expected ${project.width * project.height}.`);
  }
  const cells: BeadCell[] = project.cells.map((colorId, index) => ({
    row: Math.floor(index / project.width),
    column: index % project.width,
    colorId,
    confirmed: false,
    source: 'conversion',
  }));
  return normalizeProject({
    ...base,
    name: project.name || base.name,
    grid: { width: project.width, height: project.height, cells },
    palette: {
      id: project.paletteVersion?.includes('221') ? 'mard-221' : 'mard-291',
      brand: project.activeBrand || 'MARD',
      version: project.paletteVersion || 'unknown',
      calibrated: false,
    },
    createdAt: project.createdAt || base.createdAt,
    updatedAt: project.updatedAt || base.updatedAt,
  });
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function createProjectId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createProjectGrid(width: number, height: number): BeadProject['grid'] {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) {
    throw new RangeError(`Grid dimensions must be positive integers; received ${width}x${height}.`);
  }
  return {
    width,
    height,
    cells: Array.from({ length: width * height }, (_, index) => ({
      row: Math.floor(index / width),
      column: index % width,
      colorId: null,
      confirmed: true,
      source: 'manual' as const,
    })),
  };
}

function normalizeProjectGrid(grid: BeadProject['grid']): BeadProject['grid'] {
  const expected = grid.width * grid.height;
  if (!Array.isArray(grid.cells) || grid.cells.length !== expected) {
    throw new Error(`Grid contains ${grid.cells?.length ?? 0} cells; expected ${expected}.`);
  }
  return {
    width: grid.width,
    height: grid.height,
    cells: grid.cells.map((cell, index) => ({
      ...cell,
      row: Math.floor(index / grid.width),
      column: index % grid.width,
      colorId: cell.colorId ?? null,
      confirmed: Boolean(cell.confirmed),
      source: cell.source ?? 'manual',
    })),
  };
}

