import process from 'node:process';
import fs from 'fs';
import path from 'path';
import { User } from '@moteur/types/User';
import { writeJson } from './utils/fileUtils';

const USERS_FILE = path.resolve(process.env.AUTH_USERS_FILE || 'data/users.json');

export function getUsers(): User[] {
    if (!fs.existsSync(USERS_FILE)) {
        throw new Error('Users file not found');
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
}

export function getUserByEmail(email: string): User | undefined {
    return getUsers().find(u => u.email === email);
}

export function getUserById(id: string): User | undefined {
    return getUsers().find(u => u.id === id);
}

export function createUser(user: User): User {
    const users = getUsers();
    if (users.some(u => u.email === user.email)) {
        throw new Error('User with this email already exists');
    }
    users.push(user);
    writeJson(USERS_FILE, users);
    return user;
}

export function listUsers(): User[] {
    return getUsers();
}
