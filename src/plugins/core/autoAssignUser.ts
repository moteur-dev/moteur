import { onEvent } from '../../utils/eventBus';
import { User } from '../../types/User';
import { ProjectSchema } from '../../types/Project';

onEvent('project.beforeCreate', async ({ project, user }) => {
    if (!project.users || project.users.length === 0) {
        if (user) {
            project.users = [user.id];
        }
    }
});
