import { OpenAPIV3 } from 'openapi-types';
import { loadPluginsForProject } from './loadPlugins';

/**
 * Merges OpenAPI specs from core and plugins.
 * @param baseSpec The base OpenAPI spec to extend
 * @param projectPluginIds Optional list of plugin IDs to load
 */
export async function mergePluginSpecs(
    baseSpec: OpenAPIV3.Document,
    projectPluginIds: string[] = []
): Promise<OpenAPIV3.Document> {
    const merged: OpenAPIV3.Document = {
        ...baseSpec,
        paths: { ...baseSpec.paths }
    };

    // Load all plugins for the project
    const plugins = await loadPluginsForProject(projectPluginIds);

    for (const plugin of plugins) {
        const openapi = plugin.openapi;
        if (!openapi || !openapi.paths) continue;

        const basePath = plugin.manifest?.basePath ?? `/plugins/${plugin.manifest?.id}`;

        for (const [subpath, def] of Object.entries(openapi.paths)) {
            const fullPath = `${basePath}${subpath}`;
            if (merged.paths[fullPath]) {
                console.warn(`⚠️ Conflict: OpenAPI path already exists: ${fullPath}`);
            }
            merged.paths[fullPath] = def as OpenAPIV3.PathItemObject;
        }
    }

    return merged;
}
