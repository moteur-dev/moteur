import fs from 'fs';
import path from 'path';
import { verifyJWT, requireRole } from '../../api/auth.js';
import { User } from '../../types/User.js';

const TOKEN_FILE = path.resolve(
    process.env.HOME || process.env.USERPROFILE || '.',
    '.moteur-cli-token.json'
);

export function cliLoadAuthToken(): string {
    if (fs.existsSync(TOKEN_FILE)) {
        return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')).token;
    }
    throw new Error('❌ Not authenticated. Please run `cli auth login`.');
}

export function cliLoadUser(): User {
    const token = cliLoadAuthToken();
    if (!token) {
        throw new Error('❌ No authentication token found. Please run `cli auth login`.');
    }
    const user: User = verifyJWT(token) as User;
    if (!user.isActive) {
        throw new Error('❌ User is not active. Please contact support.');
    }
    return user;
}

export function cliRequireRole(requiredRole: string): User {
    try {
        const user = cliLoadUser();
        return requireRole(user as User, requiredRole);
    } catch (err) {
        throw new Error(`❌ Access denied: ${err instanceof Error ? err.message : err}`);
    }
}
