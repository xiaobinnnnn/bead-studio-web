import { normalizeProject } from './project';
import type { BeadProject } from './types';

export const projectFileSchemaVersion = '2.0.0';

type ProjectFileV2 = {
  format: 'bead-studio-project';
  schemaVersion: typeof projectFileSchemaVersion;
  exportedAt: string;
  project: BeadProject;
};

export function serializeProjectFile(project: BeadProject): string {
  const file: ProjectFileV2 = {
    format: 'bead-studio-project',
    schemaVersion: projectFileSchemaVersion,
    exportedAt: new Date().toISOString(),
    project: normalizeProject(project),
  };
  return JSON.stringify(file, null, 2);
}

export function parseProjectFile(json: string): BeadProject {
  const parsed = JSON.parse(json) as unknown;
  if (!parsed || typeof parsed !== 'object') throw new Error('Project JSON must contain an object.');
  const candidate = parsed as Partial<ProjectFileV2> & Partial<BeadProject>;
  if (candidate.format === 'bead-studio-project') {
    if (candidate.schemaVersion !== projectFileSchemaVersion || !candidate.project) {
      throw new Error(`Unsupported project schema: ${candidate.schemaVersion ?? 'unknown'}.`);
    }
    return normalizeProject(candidate.project);
  }
  if (candidate.width && candidate.height && Array.isArray(candidate.cells)) {
    return normalizeProject(candidate as BeadProject);
  }
  throw new Error('This is not a supported Bead Studio project file.');
}

