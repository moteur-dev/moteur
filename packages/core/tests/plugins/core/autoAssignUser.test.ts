import { describe, it, expect } from 'vitest';
import '../../../src/plugins/core/autoAssignUser';
import { triggerEvent } from '../../../src/utils/eventBus';
import { User } from '@moteur/types/User';
import { ProjectSchema } from '@moteur/types/Project';

describe('coreAutoAssignUser plugin', () => {
    const user: User = { id: 'user1', email: '', password: '' } as any;

    it('should assign user to project if no users', async () => {
        const project: ProjectSchema = { id: 'p1', label: 'Test', defaultLocale: 'en' };

        await triggerEvent('project.beforeCreate', { project, user });

        expect(project.users).toEqual([user.id]);
    });

    it('should not overwrite existing users', async () => {
        const project: ProjectSchema = {
            id: 'p1',
            label: 'Test',
            users: ['someone'],
            defaultLocale: 'en'
        };

        await triggerEvent('project.beforeCreate', { project, user });

        expect(project.users).toEqual(['someone']);
    });
});
