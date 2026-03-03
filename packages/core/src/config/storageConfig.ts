import path from 'path';
import process from 'node:process';
import fs from 'fs';

/**
 * Root for resolving relative storage paths.
 * Default: process.cwd(). Override with DATA_ROOT for explicit root.
 */
function getDataRoot(): string {
    return path.resolve(process.env.DATA_ROOT || process.cwd());
}

/** Resolve a path relative to the data root. */
function resolveFromRoot(relativePath: string): string {
    const normalized = path.normalize(relativePath);
    if (path.isAbsolute(normalized)) {
        return normalized;
    }
    return path.join(getDataRoot(), normalized);
}

/**
 * Centralized storage-related configuration.
 * Single source of truth for PROJECTS_DIR and AUTH_USERS_FILE.
 * All paths are resolved and validated at read time.
 */
export const storageConfig = {
    /**
     * Directory containing all project folders.
     * Env: PROJECTS_DIR. Default: data/projects (relative to data root).
     */
    get projectsDir(): string {
        const raw = process.env.PROJECTS_DIR || 'data/projects';
        return resolveFromRoot(raw);
    },

    /**
     * Path to the users JSON file (auth).
     * Env: AUTH_USERS_FILE. Default: data/users.json (relative to data root).
     */
    get usersFile(): string {
        const raw = process.env.AUTH_USERS_FILE || 'data/users.json';
        return resolveFromRoot(raw);
    },

    /** Data root used for resolving relative paths. */
    get dataRoot(): string {
        return getDataRoot();
    }
};

/**
 * Validates that storage paths exist or are creatable.
 * Call at startup to fail fast on misconfiguration.
 * @throws Error if validation fails
 */
export function validateStorageConfig(): void {
    const root = storageConfig.dataRoot;
    const projectsDir = storageConfig.projectsDir;
    const usersFile = storageConfig.usersFile;
    const usersDir = path.dirname(usersFile);

    if (!fs.existsSync(root)) {
        throw new Error(`[Moteur] DATA_ROOT does not exist: ${root}`);
    }
    if (!fs.existsSync(projectsDir)) {
        try {
            fs.mkdirSync(projectsDir, { recursive: true });
        } catch (_e) {
            throw new Error(`[Moteur] PROJECTS_DIR cannot be created: ${projectsDir}`);
        }
    }
    if (!fs.existsSync(usersDir)) {
        try {
            fs.mkdirSync(usersDir, { recursive: true });
        } catch (_e) {
            throw new Error(`[Moteur] AUTH_USERS_FILE directory cannot be created: ${usersDir}`);
        }
    }
    if (!fs.existsSync(usersFile)) {
        try {
            fs.writeFileSync(usersFile, '[]', 'utf-8');
        } catch (_e) {
            throw new Error(`[Moteur] AUTH_USERS_FILE cannot be created: ${usersFile}`);
        }
    }
}
