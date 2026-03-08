import '../helpers/mockCliUser';

vi.mock('@moteur/core/users.js', () => ({
    listUsers: vi.fn(),
    createUser: vi.fn()
}));

vi.mock('@moteur/core/projects.js', () => ({
    loadProjects: vi.fn(),
    getProjectIdsForUser: vi.fn((userId: string) => (userId === 'u1' ? ['p1'] : userId === 'u2' ? ['site1'] : []))
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listUsersCommand } from '../../src/commands/auth.js';
import { listUsers } from '@moteur/core/users.js';
import { loadProjects } from '@moteur/core/projects.js';

describe('auth list command', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('listUsersCommand outputs JSON without passwordHash when --json is set', async () => {
        (listUsers as vi.Mock).mockReturnValue([
            {
                id: 'u1',
                email: 'a@test.com',
                isActive: true,
                roles: ['admin'],
                projects: ['p1'],
                passwordHash: 'secret'
            }
        ]);

        await listUsersCommand({ json: true });

        expect(logSpy).toHaveBeenCalledTimes(1);
        const output = logSpy.mock.calls[0][0];
        const parsed = JSON.parse(output as string);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toMatchObject({
            id: 'u1',
            email: 'a@test.com',
            isActive: true,
            roles: ['admin'],
            projects: ['p1']
        });
        expect(parsed[0]).not.toHaveProperty('passwordHash');
    });

    it('listUsersCommand outputs human-readable list when no --json', async () => {
        (listUsers as vi.Mock).mockReturnValue([
            {
                id: 'u1',
                email: 'a@test.com',
                isActive: true,
                roles: ['admin'],
                projects: ['p1']
            }
        ]);

        await listUsersCommand({});

        expect(logSpy).toHaveBeenCalledWith('👤 Users:');
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('u1'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('a@test.com'));
    });

    it('listUsersCommand with --quiet outputs nothing for human-readable', async () => {
        (listUsers as vi.Mock).mockReturnValue([
            { id: 'u1', email: 'a@test.com', isActive: true, roles: [], projects: [] }
        ]);

        await listUsersCommand({ quiet: true });

        expect(logSpy).not.toHaveBeenCalled();
    });

    it('listUsersCommand with --project filters by project', async () => {
        (loadProjects as vi.Mock).mockReturnValue([{ id: 'site1', users: ['u2'] }]);
        (listUsers as vi.Mock).mockReturnValue([
            { id: 'u1', email: 'a@test.com', isActive: true, roles: [], projects: [] },
            {
                id: 'u2',
                email: 'b@test.com',
                isActive: true,
                roles: ['editor'],
                projects: ['site1']
            }
        ]);

        await listUsersCommand({ project: 'site1' });

        expect(loadProjects).toHaveBeenCalled();
        expect(listUsers).toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith('👤 Users:');
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('u2'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('b@test.com'));
    });
});
