import process from 'node:process';
import fs from 'fs';
import path from 'path';
import { User } from '@moteur/types/User';
import { writeJson } from './utils/fileUtils';

const USERS_FILE = path.resolve(process.env.AUTH_USERS_FILE || 'data/users.json');

let cachedUsers: User[] | null = null;

export function getCachedUsers(): User[] {
    if (!cachedUsers) {
        if (!fs.existsSync(USERS_FILE)) {
            throw new Error('Users file not found');
        }
        const data = fs.readFileSync(USERS_FILE, 'utf-8');
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
    writeJson(USERS_FILE, users);
    cachedUsers = null; // Invalidate cache after write
    return user;
}

// Optional: expose for debugging or forced reloads
export function reloadUsers(): void {
    cachedUsers = null;
}
