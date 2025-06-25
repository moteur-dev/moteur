import { Server as IOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { registerAuthMiddleware } from './auth';
import { registerJoinRoom } from './events/joinRoom';
import { registerLeaveRoom } from './events/leaveRoom';
import { registerPresenceUpdate } from './events/presenceUpdate';
import { registerDisconnect } from './events/disconnect';

export function createPresenceServer(httpServer: HTTPServer): IOServer {
    const io = new IOServer(httpServer, {
        cors: {
            origin: '*' // TODO: restrict this in prod
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
