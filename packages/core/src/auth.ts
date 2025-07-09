import bcrypt from 'bcrypt';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

import { getUserByEmail } from './users';
import { User } from '@moteur/types/User';

const JWT_SECRET = process.env.JWT_SECRET ?? 'super-jwt-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRY ?? '1h';

export async function loginUser(
    email: string,
    password: string
): Promise<{ token: string; user: User }> {
    if (!email || !password) {
        throw new Error('Missing email or password');
    }

    const user = getUserByEmail(email);
    // If user is not found, throw an error
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, user.passwordHash as string);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    if (!user.isActive) {
        throw new Error('User is not active');
    }

    return {
        token: generateJWT(user),
        user
    };
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
