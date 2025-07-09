import type { Socket } from 'socket.io';
import { verifyJWT } from '@moteur/core/auth';

export function registerAuthMiddleware(io: import('socket.io').Server) {
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.query?.token ||
                socket.handshake.headers['authorization']?.toString().replace(/^Bearer\s+/, '');

            if (!token) {
                return next(new Error('Unauthorized: Missing token'));
            }

            const decoded = verifyJWT(token); // throws if invalid

            // Optional: validate expected shape
            if (!decoded || !decoded.id || !decoded.email) {
                return next(new Error('Unauthorized: Invalid token payload'));
            }

            socket.data.user = {
                userId: decoded.id,
                name: decoded.email,
                avatarUrl: decoded.avatarUrl, // optional
                roles: decoded.roles || [],
                projects: decoded.projects || []
            };

            next();
        } catch (_err) {
            return next(new Error('Unauthorized: Invalid or expired token'));
        }
    });
}
