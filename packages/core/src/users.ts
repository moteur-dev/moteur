import fs from 'fs';
import { User } from '@moteur/types/User.js';
import { storageConfig } from './config/storageConfig.js';
import { writeJson } from './utils/fileUtils.js';

function getUsersFilePath(): string {
    return storageConfig.usersFile;
}

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

export function createUser(user: User): User {
    const users = getCachedUsers();
    if (users.some(u => u.email === user.email)) {
        throw new Error('User with this email already exists');
    }
    users.push(user);
    writeJson(getUsersFilePath(), users);
    cachedUsers = null; // Invalidate cache after write
    return user;
}

// Optional: expose for debugging or forced reloads
export function reloadUsers(): void {
    cachedUsers = null;
}
