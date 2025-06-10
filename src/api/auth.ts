import bcrypt from 'bcrypt';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { moteurConfig } from '../../moteur.config.js';
import { getUserByEmail } from './users.js';

import { User } from '../types/User.js';

const JWT_SECRET = moteurConfig.auth?.jwtSecret ?? 'super-jwt-secret-key';
const JWT_EXPIRES_IN = moteurConfig.auth?.jwtExpiresIn ?? '2h';

export async function loginUser(email: string, password: string): Promise<string> {
    if (!email || !password) {
        throw new Error('Missing email or password');
    }

    const user = getUserByEmail(email);
    // If user is not found, throw an error
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    if (!user.isActive) {
        throw new Error('User is not active');
    }

    return generateJWT(user);
}

export function generateJWT(user: User): string {
    if (!JWT_SECRET) {
        throw new Error('Missing JWT_SECRET in environment');
    }
    const payload: JwtPayload = {
        sub: user.id,
        id: user.id,
        email: user.email,
        roles: user.roles,
        projects: user.projects,
        isActive: user.isActive
    };
    const token: string = jwt.sign(
        payload,
        JWT_SECRET as Secret,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );
    return token;
}

export function verifyJWT(token: string): JwtPayload {
    if (!JWT_SECRET) {
        throw new Error('Missing JWT_SECRET in environment');
    }

    try {
        const decoded: JwtPayload = jwt.verify(token, JWT_SECRET as Secret) as JwtPayload;
        return decoded;
    } catch (err) {
        throw new Error(
            `Invalid or expired token [ ${err instanceof Error ? err.message : 'Unknown error'} ]`
        );
    }
}

export function requireRole(user: User, requiredRole: string): User {
    if (!user.isActive) {
        throw new Error('User is not active');
    }
    if (!user.roles?.includes(requiredRole)) {
        throw new Error(`Access denied: ${requiredRole} role required.`);
    }
    return user;
}
