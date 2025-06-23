import '../helpers/mockCliUser';

vi.mock('@moteur/core/projects.js', () => ({
    getProject: vi.fn(),
    listProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn()
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    listProjectsCommand,
    getProjectCommand,
    createProjectCommand,
    patchProjectCommand,
    deleteProjectCommand
} from '../../src/commands/project';

import { getProject, listProjects, createProject, updateProject } from '@moteur/core/projects.js';

describe('projectsMenu commands', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('listProjectsCommand outputs JSON when --json is set', async () => {
        (listProjects as vi.Mock).mockReturnValue([{ id: 'p1', label: 'Project 1' }]);

        await listProjectsCommand({ json: true });

        expect(logSpy).toHaveBeenCalledTimes(1);
        const output = logSpy.mock.calls[0][0];
        expect(JSON.parse(output as string)).toEqual([{ id: 'p1', label: 'Project 1' }]);
    });

    it('listProjectsCommand outputs text when no --json or --quiet', async () => {
        (listProjects as vi.Mock).mockReturnValue([{ id: 'p1', label: 'Project 1' }]);

        await listProjectsCommand({});

        expect(logSpy).toHaveBeenCalledWith('📁 Projects:');
    });

    it('listProjectsCommand outputs nothing when --quiet and no projects', async () => {
        (listProjects as vi.Mock).mockReturnValue([]);

        await listProjectsCommand({ quiet: true });

        expect(logSpy).not.toHaveBeenCalled();
    });

    it('getProjectCommand outputs JSON when --json is set', async () => {
        (getProject as vi.Mock).mockReturnValue({ id: 'p1', label: 'Project 1' });

        await getProjectCommand({ id: 'p1', json: true });

        const output = logSpy.mock.calls[0][0];
        expect(JSON.parse(output as string)).toEqual({ id: 'p1', label: 'Project 1' });
    });

    it('getProjectCommand outputs text when no --json or --quiet', async () => {
        (getProject as vi.Mock).mockReturnValue({ id: 'p1', label: 'Project 1' });

        await getProjectCommand({ id: 'p1' });

        expect(logSpy).toHaveBeenCalledWith('📁 Project "p1":');
    });

    it('createProjectCommand logs creation message', async () => {
        (createProject as vi.Mock).mockReturnValue({ id: 'p1', label: 'New Project' });

        await createProjectCommand({
            data: JSON.stringify({ label: 'New Project' }),
            quiet: false
        });

        expect(logSpy).toHaveBeenCalledWith('✅ Created project');
    });

    it('patchProjectCommand logs patch message', async () => {
        (updateProject as vi.Mock).mockReturnValue({ id: 'p1', label: 'Updated' });

        await patchProjectCommand({ id: 'p1', data: JSON.stringify({ label: 'Updated' }) });

        expect(logSpy).toHaveBeenCalledWith('🔧 Patched project "p1"');
    });

    it('deleteProjectCommand logs deletion message', async () => {
        await deleteProjectCommand({ id: 'p1' });

        expect(logSpy).toHaveBeenCalledWith('🗑️ Moved project "p1" to trash');
    });
});
