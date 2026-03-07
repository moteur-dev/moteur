import path from 'path';
import { storageConfig } from '../config/storageConfig.js';

export function baseProjectsDir(): string {
    return storageConfig.projectsDir;
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

export function baseTemplatesDir(projectId: string): string {
    return path.join(projectDir(projectId), 'templates');
}

export function basePagesDir(projectId: string): string {
    return path.join(projectDir(projectId), 'pages');
}

export function baseAssetsDir(projectId: string): string {
    return path.join(projectDir(projectId), 'assets');
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

export function templateFilePath(projectId: string, templateId: string): string {
    return path.join(baseTemplatesDir(projectId), `${templateId}.json`);
}

export function pageFilePath(projectId: string, pageId: string): string {
    return path.join(basePagesDir(projectId), `${pageId}.json`);
}

/** Original asset file path: assets/original/{id}-{filename} */
export function assetOriginalPath(projectId: string, assetId: string, filename: string): string {
    return path.join(baseAssetsDir(projectId), 'original', `${assetId}-${filename}`);
}

/** Variant path: assets/{variantKey}/{id}.{ext} */
export function assetVariantPath(
    projectId: string,
    variantKey: string,
    assetId: string,
    ext: string
): string {
    return path.join(baseAssetsDir(projectId), variantKey, `${assetId}.${ext}`);
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

export function trashTemplatesDir(projectId: string): string {
    return path.join(baseProjectsTrashDir(), projectId, 'templates');
}

export function trashPagesDir(projectId: string): string {
    return path.join(baseProjectsTrashDir(), projectId, 'pages');
}
