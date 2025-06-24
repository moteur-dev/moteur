import { Socket } from 'socket.io';
import { presenceStore } from '../PresenceStore';

export function registerDisconnect(socket: Socket) {
  socket.on('disconnect', () => {
    const prev = presenceStore.get(socket.id);
    if (!prev) return;

    const { projectId, userId } = prev;
    presenceStore.remove(socket.id);

    console.log(`[presence] ${userId} disconnected from project ${projectId}`);

    // Notify others
    socket.to(projectId).emit('presence:change', {
      userId,
      changes: null // 🧠 interpreted as "user left"
    });
  });
}
