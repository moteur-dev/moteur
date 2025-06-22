import fs from 'fs';
import {
    projectDir,
    trashProjectDir,
    projectFilePath,
    modelDir,
    trashModelDir,
    modelFilePath,
    entryDir,
    trashEntryDir,
    entryFilePath,
    layoutDir,
    trashLayoutDir,
    layoutFilePath,
    structureDir,
    trashStructureDir,
    structureFilePath
} from './pathUtils';

export function readJson(file: string): any {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
}

export function writeJson(file: string, data: any): void {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

/** Check if a project exists (directory) */
export function isExistingProjectId(projectId: string): boolean {
    return fs.existsSync(projectDir(projectId));
}

/** Check if a project definition file exists */
export function isExistingProjectSchema(projectId: string): boolean {
    return fs.existsSync(projectFilePath(projectId));
}

/** Check if a model exists (directory) */
export function isExistingModelId(projectId: string, modelId: string): boolean {
    return fs.existsSync(modelDir(projectId, modelId));
}

/** Check if a model definition file exists */
export function isExistingModelSchema(projectId: string, modelId: string): boolean {
    return fs.existsSync(modelFilePath(projectId, modelId));
}

/** Check if an entry exists (directory) */
export function isExistingEntryId(projectId: string, modelId: string, entryId: string): boolean {
    return fs.existsSync(entryDir(projectId, modelId, entryId));
}

/** Check if an entry definition file exists */
export function isExistingEntrySchema(
    projectId: string,
    modelId: string,
    entryId: string
): boolean {
    return fs.existsSync(entryFilePath(projectId, modelId, entryId));
}

/** Check if a layout exists (directory) */
export function isExistingLayoutId(projectId: string, layoutId: string): boolean {
    return fs.existsSync(layoutDir(projectId, layoutId));
}

/** Check if a layout definition file exists */
export function isExistingLayoutSchema(projectId: string, layoutId: string): boolean {
    return fs.existsSync(layoutFilePath(projectId, layoutId));
}

/** Check if a structure exists (directory) */
export function isExistingStructureId(projectId: string, structureId: string): boolean {
    return fs.existsSync(structureDir(projectId, structureId));
}

/** Check if a structure definition file exists */
export function isExistingStructureSchema(projectId: string, structureId: string): boolean {
    return fs.existsSync(structureFilePath(projectId, structureId));
}
