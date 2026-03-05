import fs from 'fs';
import { User } from '@moteur/types/User.js';
import { storageConfig } from './config/storageConfig.js';
import { writeJsonAtomic } from './utils/fileUtils.js';
import { triggerEvent } from './utils/eventBus.js';

function getUsersFilePath(): string {
    return storageConfig.usersFile;
}

/**
 * In-memory cache of users. Invalidated on write in this process.
 * Concurrency: users.json is written atomically (temp file + rename).
 * Multiple processes (e.g. API + CLI) should not write concurrently to the same file;
 * prefer a single writer or move to a proper database for multi-instance deployments.
 */
let cachedUsers: User[] | null = null;

export function getCachedUsers(): User[] {
    if (!cachedUsers) {
        const usersFile = getUsersFilePath();
        if (!fs.existsSync(usersFile)) {
            return [];
        }
        const data = fs.readFileSync(usersFile, 'utf-8');
        cachedUsers = JSON.parse(data);
    }
    return cachedUsers ?? [];
}

export function listUsers(): User[] {
    return getCachedUsers();
}

export function getUserByEmail(email: string): User | undefined {
    return getCachedUsers().find(u => u.email === email);
}

export function getUserById(id: string): User | undefined {
    return getCachedUsers().find(u => u.id === id);
}

export function getProjectUsers(projectId: string): User[] {
    return getCachedUsers().filter(user => user.projects?.includes(projectId));
}

/**
 * Return user.projects filtered to only IDs that exist (e.g. for display or JWT).
 * Pass existingProjectIds from loadProjects().map(p => p.id) to avoid orphan refs.
 */
export function getDisplayProjectIds(user: User, existingProjectIds: string[]): string[] {
    const set = new Set(existingProjectIds);
    return (user.projects ?? []).filter(id => set.has(id));
}

export function createUser(user: User, performedBy?: User): User {
    const users = getCachedUsers();
    if (users.some(u => u.email === user.email)) {
        throw new Error('User with this email already exists');
    }
    triggerEvent('user.beforeCreate', { user, performedBy });
    users.push(user);
    writeJsonAtomic(getUsersFilePath(), users);
    cachedUsers = null; // Invalidate cache after write
    triggerEvent('user.afterCreate', { user, performedBy });
    return user;
}

/**
 * Add a project ID to a user's projects array (e.g. after project create).
 * Keeps user.projects in sync so the creator is linked to the new project.
 * Reads users from file to avoid stale cache from the same request.
 * @throws Error if user not found (so assignment failure is not silent).
 */
export function addProjectToUser(userId: string, projectId: string): void {
    if (!userId || !projectId) {
        throw new Error('addProjectToUser: userId and projectId are required');
    }
    const filePath = getUsersFilePath();
    let users: User[];
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        users = JSON.parse(data);
    } catch (err) {
        throw new Error(
            `addProjectToUser: failed to read users file (${filePath}): ${err instanceof Error ? err.message : String(err)}`
        );
    }
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
        throw new Error(
            `addProjectToUser: user "${userId}" not found in users file. Cannot assign project "${projectId}".`
        );
    }
    const u = users[index];
    const projects = u.projects ?? [];
    if (projects.includes(projectId)) return;
    users = users.slice();
    users[index] = { ...u, projects: [...projects, projectId] };
    try {
        writeJsonAtomic(filePath, users);
    } catch (err) {
        throw new Error(
            `addProjectToUser: failed to write users file (${filePath}): ${err instanceof Error ? err.message : String(err)}`
        );
    }
    cachedUsers = null;
}

/**
 * Remove a project ID from every user's projects array (e.g. after project delete).
 * Keeps user.projects in sync so orphan links are not left in users.json.
 */
export function removeProjectFromAllUsers(projectId: string): void {
    const users = getCachedUsers();
    let changed = false;
    const updated = users.map(u => {
        if (!u.projects?.length) return u;
        const next = (u.projects ?? []).filter(id => id !== projectId);
        if (next.length !== (u.projects?.length ?? 0)) {
            changed = true;
            return { ...u, projects: next };
        }
        return u;
    });
    if (changed) {
        writeJsonAtomic(getUsersFilePath(), updated);
        cachedUsers = null;
    }
}

// Optional: expose for debugging or forced reloads
export function reloadUsers(): void {
    cachedUsers = null;
}
