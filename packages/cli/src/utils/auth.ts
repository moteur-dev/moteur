import fs from 'fs';
import path from 'path';
import { verifyJWT, requireRole } from '@moteur/core/auth.js';
import { User } from '@moteur/types/User.js';

const TOKEN_FILE = path.resolve(
    process.env.HOME || process.env.USERPROFILE || '.',
    '.moteur-cli-token.json'
);

export function cliLoadAuthToken(): string {
    if (!fs.existsSync(TOKEN_FILE)) {
        throw new Error('❌ Not authenticated. Please run `cli auth login`.');
    }
    let token: unknown;
    try {
        const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
        token = data?.token;
        // Backward compat: file was previously saved with full loginUser result as .token
        if (
            token &&
            typeof token === 'object' &&
            'token' in token &&
            typeof (token as { token: unknown }).token === 'string'
        ) {
            token = (token as { token: string }).token;
        }
    } catch {
        throw new Error('❌ Invalid token file. Please run `cli auth login` again.');
    }
    if (typeof token !== 'string' || !token) {
        throw new Error(
            '❌ Invalid or missing token in session file. Please run `cli auth login` again.'
        );
    }
    return token;
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
