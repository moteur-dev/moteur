import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { listCollections, getCollection } from '@moteur/core/apiCollections.js';
import { listEntriesForProject, getEntryForProject } from '@moteur/core/entries.js';
import { listPages, getPage, getPageBySlug, resolveEntryUrl } from '@moteur/core/pages.js';
import type { PageNode } from '@moteur/types/Page.js';
import { selectFields, selectFieldsFromList } from '@moteur/core/fieldSelection.js';
import { resolveEntryReferences } from '@moteur/core/referenceResolution.js';
import { resolveEntryAssets, resolvePageAssets } from '@moteur/core/assets/assetResolver.js';
import { getModelSchemaForProject } from '@moteur/core/models.js';
import { getTemplate } from '@moteur/core/templates.js';
import type { ApiCollectionResource } from '@moteur/types/ApiCollection.js';
import type { EntryStatus } from '@moteur/types/Model.js';

const router: Router = Router({ mergeParams: true });

function getStatusFilter(resource: ApiCollectionResource, apiKeyOnly: boolean): EntryStatus[] {
    if (apiKeyOnly) return ['published'];
    const status = resource.filters?.status;
    if (status == null) return ['published'];
    return Array.isArray(status) ? status : [status];
}

function findResource(
    collection: { resources: ApiCollectionResource[] },
    resourceId: string
): ApiCollectionResource | undefined {
    return collection.resources.find(r => r.resourceId === resourceId);
}

// GET /projects/:projectId/collections
router.get('/', async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const list = await listCollections(projectId);
        return res.json(list);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list collections' });
    }
});

// GET /projects/:projectId/collections/:collectionId
router.get('/:collectionId', async (req: any, res: any) => {
    const { projectId, collectionId } = req.params;
    if (!projectId || !collectionId)
        return res.status(400).json({ error: 'Missing projectId or collectionId' });
    try {
        const collection = await getCollection(projectId, collectionId);
        if (!collection) return res.status(404).json({ error: 'Collection not found' });
        return res.json(collection);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get collection' });
    }
});

// GET /projects/:projectId/collections/:collectionId/pages
router.get('/:collectionId/pages', async (req: any, res: any) => {
    const { projectId, collectionId } = req.params;
    if (!projectId || !collectionId)
        return res.status(400).json({ error: 'Missing projectId or collectionId' });
    try {
        const collection = await getCollection(projectId, collectionId);
        if (!collection) return res.status(404).json({ error: 'Collection not found' });
        const pageResource = collection.resources.find(r => r.resourceType === 'page');
        if (!pageResource)
            return res.status(404).json({ error: 'Collection does not expose pages' });
        const apiKeyOnly = !req.user && req.apiKeyAuth;
        const statuses = getStatusFilter(pageResource, apiKeyOnly);
        let pages = await listPages(projectId, {
            templateId: pageResource.resourceId === 'pages' ? undefined : pageResource.resourceId
        });
        pages = pages.filter(p => 'status' in p && statuses.includes((p as any).status));
        if (req.query.resolveAssets === '1') {
            pages = await Promise.all(
                pages.map(async p => {
                    if (p.type === 'folder' || !('templateId' in p)) return p;
                    const template = await getTemplate(projectId, (p as any).templateId);
                    return resolvePageAssets(projectId, p as any, template) as Promise<PageNode>;
                })
            );
        }
        return res.json(pages);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list pages' });
    }
});

// GET /projects/:projectId/collections/:collectionId/pages/by-slug/:slug
router.get('/:collectionId/pages/by-slug/:slug', async (req: any, res: any) => {
    const { projectId, collectionId, slug } = req.params;
    if (!projectId || !collectionId || slug === undefined)
        return res.status(400).json({ error: 'Missing projectId, collectionId or slug' });
    try {
        const collection = await getCollection(projectId, collectionId);
        if (!collection) return res.status(404).json({ error: 'Collection not found' });
        const pageResource = collection.resources.find(r => r.resourceType === 'page');
        if (!pageResource)
            return res.status(404).json({ error: 'Collection does not expose pages' });
        const page = await getPageBySlug(projectId, slug);
        if (!page) return res.status(404).json({ error: 'Page not found' });
        const apiKeyOnly = !req.user && req.apiKeyAuth;
        const statuses = getStatusFilter(pageResource, apiKeyOnly);
        if (!('status' in page) || !statuses.includes((page as any).status))
            return res.status(404).json({ error: 'Page not found' });
        if (req.query.resolveAssets === '1' && 'templateId' in page) {
            const template = await getTemplate(projectId, (page as any).templateId);
            const resolved = await resolvePageAssets(projectId, page as any, template);
            return res.json(resolved);
        }
        return res.json(page);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get page' });
    }
});

// GET /projects/:projectId/collections/:collectionId/pages/:id
router.get('/:collectionId/pages/:id', async (req: any, res: any) => {
    const { projectId, collectionId, id } = req.params;
    if (!projectId || !collectionId || !id)
        return res.status(400).json({ error: 'Missing projectId, collectionId or id' });
    try {
        const collection = await getCollection(projectId, collectionId);
        if (!collection) return res.status(404).json({ error: 'Collection not found' });
        const pageResource = collection.resources.find(r => r.resourceType === 'page');
        if (!pageResource)
            return res.status(404).json({ error: 'Collection does not expose pages' });
        const page = await getPage(projectId, id);
        const apiKeyOnly = !req.user && req.apiKeyAuth;
        const statuses = getStatusFilter(pageResource, apiKeyOnly);
        if (!('status' in page) || !statuses.includes((page as any).status))
            return res.status(404).json({ error: 'Page not found' });
        if (req.query.resolveAssets === '1' && 'templateId' in page) {
            const template = await getTemplate(projectId, (page as any).templateId);
            const resolved = await resolvePageAssets(projectId, page as any, template);
            return res.json(resolved);
        }
        return res.json(page);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Page not found' });
    }
});

// GET /projects/:projectId/collections/:collectionId/:resourceId/entries
router.get('/:collectionId/:resourceId/entries', async (req: any, res: any) => {
    const { projectId, collectionId, resourceId } = req.params;
    if (!projectId || !collectionId || !resourceId)
        return res.status(400).json({ error: 'Missing path parameters' });
    try {
        const collection = await getCollection(projectId, collectionId);
        if (!collection) return res.status(404).json({ error: 'Collection not found' });
        const resource = findResource(collection, resourceId);
        if (!resource || resource.resourceType !== 'model')
            return res.status(404).json({ error: 'Resource not found in collection' });
        const apiKeyOnly = !req.user && req.apiKeyAuth;
        const statuses = getStatusFilter(resource, apiKeyOnly);
        let entries = await listEntriesForProject(projectId, resourceId, { status: statuses });
        const depth = (resource.resolve ?? 0) as 0 | 1 | 2;
        const fields = resource.fields && resource.fields.length > 0 ? resource.fields : undefined;
        let resolved = await Promise.all(
            entries.map(e =>
                resolveEntryReferences(e, projectId, resourceId, depth, new Set(), statuses)
            )
        );
        if (req.query.resolveAssets === '1') {
            const schema = await getModelSchemaForProject(projectId, resourceId);
            if (schema) {
                resolved = await Promise.all(
                    resolved.map(e => resolveEntryAssets(projectId, e, schema))
                );
            }
        }
        let projected = selectFieldsFromList(resolved, fields);
        if (req.query.resolveUrl === '1') {
            projected = await Promise.all(
                projected.map(async (item: any) => {
                    const url = await resolveEntryUrl(projectId, item.id, resourceId);
                    return { ...item, ...(url != null && { resolvedUrl: url }) };
                })
            );
        }
        return res.json(projected);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list entries' });
    }
});

// GET /projects/:projectId/collections/:collectionId/:resourceId/entries/:id
router.get('/:collectionId/:resourceId/entries/:id', async (req: any, res: any) => {
    const { projectId, collectionId, resourceId, id } = req.params;
    if (!projectId || !collectionId || !resourceId || !id)
        return res.status(400).json({ error: 'Missing path parameters' });
    try {
        const collection = await getCollection(projectId, collectionId);
        if (!collection) return res.status(404).json({ error: 'Collection not found' });
        const resource = findResource(collection, resourceId);
        if (!resource || resource.resourceType !== 'model')
            return res.status(404).json({ error: 'Resource not found in collection' });
        const entry = await getEntryForProject(projectId, resourceId, id);
        if (!entry) return res.status(404).json({ error: 'Entry not found' });
        const apiKeyOnly = !req.user && req.apiKeyAuth;
        const statuses = getStatusFilter(resource, apiKeyOnly);
        if (!statuses.includes((entry.status ?? 'draft') as EntryStatus))
            return res.status(404).json({ error: 'Entry not found' });
        const depth = (resource.resolve ?? 0) as 0 | 1 | 2;
        let resolved = await resolveEntryReferences(
            entry,
            projectId,
            resourceId,
            depth,
            new Set(),
            statuses
        );
        if (req.query.resolveAssets === '1') {
            const schema = await getModelSchemaForProject(projectId, resourceId);
            if (schema) resolved = await resolveEntryAssets(projectId, resolved, schema);
        }
        const fields = resource.fields && resource.fields.length > 0 ? resource.fields : undefined;
        let projected = selectFields(resolved, fields);
        if (req.query.resolveUrl === '1') {
            const url = await resolveEntryUrl(projectId, id, resourceId);
            projected = { ...projected, ...(url != null && { resolvedUrl: url }) };
        }
        return res.json(projected);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Entry not found' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/collections': {
        get: {
            summary: 'List collections (API key or JWT)',
            tags: ['Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'List of collections' } }
        }
    },
    '/projects/{projectId}/collections/{collectionId}': {
        get: {
            summary: 'Get one collection',
            tags: ['Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Collection' }, '404': { description: 'Not found' } }
        }
    },
    '/projects/{projectId}/collections/{collectionId}/{resourceId}/entries': {
        get: {
            summary: 'List entries for a collection resource (model)',
            tags: ['Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'resourceId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Entries' }, '404': { description: 'Not found' } }
        }
    },
    '/projects/{projectId}/collections/{collectionId}/{resourceId}/entries/{id}': {
        get: {
            summary: 'Get one entry in a collection',
            tags: ['Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'resourceId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Entry' }, '404': { description: 'Not found' } }
        }
    },
    '/projects/{projectId}/collections/{collectionId}/pages': {
        get: {
            summary: 'List pages in a collection',
            tags: ['Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Pages' }, '404': { description: 'Not found' } }
        }
    },
    '/projects/{projectId}/collections/{collectionId}/pages/{id}': {
        get: {
            summary: 'Get one page by id',
            tags: ['Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Page' }, '404': { description: 'Not found' } }
        }
    },
    '/projects/{projectId}/collections/{collectionId}/pages/by-slug/{slug}': {
        get: {
            summary: 'Get one page by slug',
            tags: ['Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'collectionId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Page' }, '404': { description: 'Not found' } }
        }
    }
};

export default router;
