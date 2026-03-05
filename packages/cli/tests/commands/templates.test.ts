import '../helpers/mockCliUser';

vi.mock('@moteur/core/templates.js', () => ({
    listTemplates: vi.fn(),
    getTemplateWithAuth: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    validateTemplateById: vi.fn()
}));

vi.mock('../../src/utils/projectSelectPrompt.js', () => ({
    projectSelectPrompt: vi.fn(() => Promise.resolve('testProject'))
}));

vi.mock('../../src/utils/resolveInputData.js', () => ({
    resolveInputData: vi.fn((_opts: any) =>
        Promise.resolve({
            id: 'landing',
            label: 'Landing Page',
            description: 'A landing page',
            fields: {}
        })
    )
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    listTemplatesCommand,
    getTemplateCommand,
    createTemplateCommand,
    patchTemplateCommand,
    deleteTemplateCommand,
    validateTemplateCommand
} from '../../src/commands/templates.js';
import {
    listTemplates,
    getTemplateWithAuth,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    validateTemplateById
} from '@moteur/core/templates.js';

describe('templates commands', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('listTemplatesCommand outputs JSON when --json is set', async () => {
        (listTemplates as vi.Mock).mockResolvedValue([
            {
                id: 't1',
                label: 'Template 1',
                projectId: 'p1',
                fields: {},
                createdAt: '',
                updatedAt: ''
            }
        ]);

        await listTemplatesCommand({ projectId: 'testProject', json: true });

        expect(logSpy).toHaveBeenCalledTimes(1);
        const output = logSpy.mock.calls[0][0];
        expect(JSON.parse(output)).toHaveLength(1);
        expect(JSON.parse(output)[0].id).toBe('t1');
    });

    it('listTemplatesCommand outputs text when no --json', async () => {
        (listTemplates as vi.Mock).mockResolvedValue([
            {
                id: 't1',
                label: 'Template 1',
                projectId: 'p1',
                fields: {},
                createdAt: '',
                updatedAt: ''
            }
        ]);

        await listTemplatesCommand({ projectId: 'testProject' });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Templates in project'));
    });

    it('getTemplateCommand outputs template JSON when --json', async () => {
        (getTemplateWithAuth as vi.Mock).mockResolvedValue({
            id: 'landing',
            label: 'Landing',
            projectId: 'p1',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        await getTemplateCommand({ projectId: 'testProject', id: 'landing', json: true });

        const output = logSpy.mock.calls[0][0];
        expect(JSON.parse(output).id).toBe('landing');
    });

    it('createTemplateCommand logs creation message', async () => {
        (createTemplate as vi.Mock).mockResolvedValue({
            id: 'landing',
            label: 'Landing Page',
            projectId: 'testProject',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        await createTemplateCommand({
            projectId: 'testProject',
            data: JSON.stringify({ id: 'landing', label: 'Landing Page', fields: {} }),
            quiet: false
        });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Created template "landing"'));
    });

    it('patchTemplateCommand logs patch message', async () => {
        (updateTemplate as vi.Mock).mockResolvedValue({
            id: 'landing',
            label: 'Updated',
            projectId: 'testProject',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        await patchTemplateCommand({
            projectId: 'testProject',
            id: 'landing',
            data: JSON.stringify({ label: 'Updated' })
        });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Patched template "landing"'));
    });

    it('deleteTemplateCommand logs deletion message', async () => {
        (deleteTemplate as vi.Mock).mockResolvedValue(undefined);

        await deleteTemplateCommand({ projectId: 'testProject', id: 'landing' });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Moved template "landing"'));
    });

    it('validateTemplateCommand logs valid result when valid', async () => {
        (validateTemplateById as vi.Mock).mockResolvedValue({ valid: true, issues: [] });

        await validateTemplateCommand({ projectId: 'testProject', id: 'landing', quiet: false });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('valid'));
    });
});
