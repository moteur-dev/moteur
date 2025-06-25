import { Socket } from 'socket.io';

export function registerLeaveRoom(socket: Socket): void {
    socket.on('leave', ({ projectId }) => {
        if (!projectId) return;
        socket.leave(projectId);
        console.log(`[presence] ${socket.id} left room ${projectId}`);
    });
}
