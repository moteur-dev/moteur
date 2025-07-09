import path from 'path';

export function baseProjectsDir(): string {
    return path.join(process.env.PROJECTS_DIR || 'data/projects');
}
export function baseModelsDir(projectId: string): string {
    return path.join(projectDir(projectId), 'models');
}
export function baseEntriesDir(projectId: string, modelId: string): string {
    return path.join(modelDir(projectId, modelId), 'entries');
}
export function baseLayoutsDir(projectId: string): string {
    return path.join(projectDir(projectId), 'layouts');
}
export function baseStructuresDir(projectId: string): string {
    return path.join(projectDir(projectId), 'structures');
}

export function projectDir(projectId: string): string {
    return path.join(baseProjectsDir(), projectId);
}
export function modelDir(projectId: string, modelId: string): string {
    return path.join(baseModelsDir(projectId), modelId);
}
export function entryDir(projectId: string, modelId: string, entryId: string): string {
    return path.join(baseEntriesDir(projectId, modelId), entryId);
}
export function layoutDir(projectId: string, layoutId: string): string {
    return path.join(baseLayoutsDir(projectId), layoutId);
}
export function structureDir(projectId: string, structureId: string): string {
    return path.join(baseStructuresDir(projectId), structureId);
}

export function projectFilePath(projectId: string): string {
    return path.join(projectDir(projectId), 'project.json');
}
export function modelFilePath(projectId: string, modelId: string): string {
    return path.join(modelDir(projectId, modelId), 'model.json');
}
export function entryFilePath(projectId: string, modelId: string, entryId: string): string {
    return path.join(entryDir(projectId, modelId, entryId), 'entry.json');
}
export function layoutFilePath(projectId: string, layoutId: string): string {
    return path.join(layoutDir(projectId, layoutId), 'layout.json');
}
export function structureFilePath(projectId: string, structureId: string): string {
    return path.join(structureDir(projectId, structureId), 'structure.json');
}

export function baseProjectsTrashDir(): string {
    return path.join(baseProjectsDir(), '.trash', 'projects');
}
export function trashProjectDir(projectId: string): string {
    return path.join(baseProjectsTrashDir(), projectId);
}
export function trashModelDir(projectId: string, modelId: string): string {
    return path.join(baseProjectsTrashDir(), projectId, 'models', modelId);
}
export function trashEntryDir(projectId: string, modelId: string, entryId: string): string {
    return path.join(trashModelDir(projectId, modelId), 'entries', entryId);
}
export function trashLayoutDir(projectId: string, layoutId: string): string {
    return path.join(baseProjectsTrashDir(), projectId, 'layouts', layoutId);
}
export function trashStructureDir(projectId: string, structureId: string): string {
    return path.join(baseProjectsTrashDir(), projectId, 'structures', structureId);
}
