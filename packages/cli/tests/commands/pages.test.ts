import '../helpers/mockCliUser';

vi.mock('@moteur/core/pages.js', () => ({
    listPages: vi.fn(),
    getPageWithAuth: vi.fn(),
    getPageBySlug: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    deletePage: vi.fn(),
    resolveAllUrls: vi.fn(),
    validatePageById: vi.fn(),
    validateAllPages: vi.fn()
}));

vi.mock('../../src/utils/projectSelectPrompt.js', () => ({
    projectSelectPrompt: vi.fn(() => Promise.resolve('testProject'))
}));

vi.mock('../../src/utils/resolveInputData.js', () => ({
    resolveInputData: vi.fn((_opts: any) =>
        Promise.resolve({
            templateId: 'landing',
            label: 'Home',
            slug: 'home',
            status: 'draft',
            fields: {}
        })
    )
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    listPagesCommand,
    getPageCommand,
    createPageCommand,
    patchPageCommand,
    deletePageCommand,
    urlsPageCommand,
    validatePageCommand
} from '../../src/commands/pages.js';
import {
    listPages,
    getPageWithAuth,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    resolveAllUrls,
    validatePageById,
    validateAllPages
} from '@moteur/core/pages.js';

describe('pages commands', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('listPagesCommand outputs JSON when --json is set', async () => {
        (listPages as vi.Mock).mockResolvedValue([
            {
                id: 'p1',
                projectId: 'testProject',
                templateId: 't1',
                label: 'Home',
                status: 'draft',
                fields: {},
                createdAt: '',
                updatedAt: ''
            }
        ]);

        await listPagesCommand({ projectId: 'testProject', json: true });

        expect(logSpy).toHaveBeenCalledTimes(1);
        const output = logSpy.mock.calls[0][0];
        expect(JSON.parse(output)).toHaveLength(1);
        expect(JSON.parse(output)[0].id).toBe('p1');
    });

    it('listPagesCommand outputs text when no --json', async () => {
        (listPages as vi.Mock).mockResolvedValue([
            {
                id: 'p1',
                projectId: 'testProject',
                templateId: 't1',
                label: 'Home',
                status: 'draft',
                fields: {},
                createdAt: '',
                updatedAt: ''
            }
        ]);

        await listPagesCommand({ projectId: 'testProject' });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Pages in project'));
    });

    it('getPageCommand by id outputs page JSON when --json', async () => {
        (getPageWithAuth as vi.Mock).mockResolvedValue({
            id: 'p1',
            projectId: 'testProject',
            templateId: 't1',
            label: 'Home',
            status: 'published',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        await getPageCommand({ projectId: 'testProject', id: 'p1', json: true });

        const output = logSpy.mock.calls[0][0];
        expect(JSON.parse(output).id).toBe('p1');
    });

    it('getPageCommand by slug calls getPageBySlug', async () => {
        (getPageBySlug as vi.Mock).mockResolvedValue({
            id: 'p1',
            projectId: 'testProject',
            templateId: 't1',
            label: 'Home',
            slug: 'home',
            status: 'published',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        await getPageCommand({ projectId: 'testProject', slug: 'home', json: true });

        expect(getPageBySlug).toHaveBeenCalledWith('testProject', 'home');
        const output = logSpy.mock.calls[0][0];
        expect(JSON.parse(output).slug).toBe('home');
    });

    it('createPageCommand logs creation message', async () => {
        (createPage as vi.Mock).mockResolvedValue({
            id: 'new-id',
            projectId: 'testProject',
            templateId: 'landing',
            label: 'Home',
            status: 'draft',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        await createPageCommand({
            projectId: 'testProject',
            data: JSON.stringify({ templateId: 'landing', label: 'Home', fields: {} }),
            quiet: false
        });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Created page'));
    });

    it('patchPageCommand logs patch message', async () => {
        (updatePage as vi.Mock).mockResolvedValue({
            id: 'p1',
            projectId: 'testProject',
            templateId: 't1',
            label: 'Updated',
            status: 'draft',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        await patchPageCommand({
            projectId: 'testProject',
            id: 'p1',
            data: JSON.stringify({ label: 'Updated' })
        });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Patched page "p1"'));
    });

    it('deletePageCommand logs deletion message', async () => {
        (deletePage as vi.Mock).mockResolvedValue(undefined);

        await deletePageCommand({ projectId: 'testProject', id: 'p1' });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Moved page "p1"'));
    });

    it('validatePageCommand with id calls validatePageById', async () => {
        (validatePageById as vi.Mock).mockResolvedValue({ valid: true, issues: [] });

        await validatePageCommand({ projectId: 'testProject', id: 'p1', quiet: false });

        expect(validatePageById).toHaveBeenCalledWith('testProject', 'p1');
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('valid'));
    });

    it('validatePageCommand without id calls validateAllPages', async () => {
        (validateAllPages as vi.Mock).mockResolvedValue([{ valid: true, issues: [] }]);

        await validatePageCommand({ projectId: 'testProject', quiet: false });

        expect(validateAllPages).toHaveBeenCalledWith('testProject');
    });

    it('urlsPageCommand calls resolveAllUrls and outputs URLs', async () => {
        (resolveAllUrls as vi.Mock).mockResolvedValue([
            { url: '/', nodeId: 'home', nodeType: 'static' },
            { url: '/about', nodeId: 'about', nodeType: 'static' }
        ]);

        await urlsPageCommand({ projectId: 'testProject', quiet: false });

        expect(resolveAllUrls).toHaveBeenCalledWith('testProject');
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Resolved URLs'));
    });

    it('urlsPageCommand with --sitemap outputs XML', async () => {
        (resolveAllUrls as vi.Mock).mockResolvedValue([{ url: '/', sitemapInclude: true }]);

        await urlsPageCommand({ projectId: 'testProject', sitemap: true });

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('<?xml'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('<urlset'));
    });
});
