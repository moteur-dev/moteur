import '../helpers/mockCliUser';

vi.mock('@moteur/core/users.js', () => ({
    listUsers: vi.fn(),
    getProjectUsers: vi.fn(),
    createUser: vi.fn()
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listUsersCommand } from '../../src/commands/auth.js';
import { listUsers, getProjectUsers } from '@moteur/core/users.js';

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
        (getProjectUsers as vi.Mock).mockReturnValue([
            {
                id: 'u2',
                email: 'b@test.com',
                isActive: true,
                roles: ['editor'],
                projects: ['site1']
            }
        ]);

        await listUsersCommand({ project: 'site1' });

        expect(getProjectUsers).toHaveBeenCalledWith('site1');
        expect(listUsers).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith('👤 Users:');
    });
});
