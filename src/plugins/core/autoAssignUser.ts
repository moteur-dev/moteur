import { onEvent } from '../../utils/eventBus.js';
import { User } from '../../types/User.js';
import { ProjectSchema } from '../../types/Project.js';

onEvent('project.beforeCreate', async ({ project, user }) => {
    if (!project.users || project.users.length === 0) {
        if (user) {
            project.users = [user.id];
        }
    }
});
