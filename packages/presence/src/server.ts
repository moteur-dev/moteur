import { Server as IOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { registerAuthMiddleware } from './auth.js';
import { registerJoinRoom } from './events/joinRoom.js';
import { registerLeaveRoom } from './events/leaveRoom.js';
import { registerPresenceUpdate } from './events/presenceUpdate.js';
import { registerDisconnect } from './events/disconnect.js';

function getCorsOrigin(): string | string[] {
    const env = process.env.PRESENCE_CORS_ORIGINS ?? process.env.CORS_ORIGINS;
    if (!env || !env.trim()) return '*';
    return env
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

export function createPresenceServer(httpServer: HTTPServer): IOServer {
    const io = new IOServer(httpServer, {
        cors: {
            origin: getCorsOrigin()
        }
    });

    registerAuthMiddleware(io);

    io.on('connection', (socket: Socket) => {
        console.log(`[presence] User connected: ${socket.id}`);

        // Register all event handlers for this socket
        registerJoinRoom(socket);
        registerLeaveRoom(socket);
        registerPresenceUpdate(socket);
        registerDisconnect(socket);
    });

    return io;
}
