import { onEvent } from '@/utils/eventBus';

onEvent('project.beforeCreate', async ({ project, user }) => {
    if (!project.users || project.users.length === 0) {
        if (user) {
            project.users = [user.id];
        }
    }
});
