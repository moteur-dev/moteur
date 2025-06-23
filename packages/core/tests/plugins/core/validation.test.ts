import { describe, it, expect } from 'vitest';
import '../../../plugins/core/validation';
import { triggerEvent } from '../../../utils/eventBus';
import { User } from '@mote@mote@moteur/types/User';
import { ProjectSchema } from '@mote@mote@moteur/types/Project';

describe('coreValidation plugin', () => {
    const user: User = { id: 'user1', email: '', password: '' } as any;

    it('should throw if required fields are missing', async () => {
        const project: ProjectSchema = { id: '', label: '', defaultLocale: 'en' };

        await expect(triggerEvent('project.beforeCreate', { project, user })).rejects.toThrow(
            'Project validation failed'
        );
    });

    it('should pass for valid project', async () => {
        const project: ProjectSchema = { id: 'p1', label: 'Valid', defaultLocale: 'en' };

        await expect(
            triggerEvent('project.beforeCreate', { project, user })
        ).resolves.not.toThrow();
    });
});
