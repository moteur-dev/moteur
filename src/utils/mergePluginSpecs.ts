import type { PluginModule } from '@/types/Plugin';
import { openApiSpec } from '@/routes/openapi';
import type { OpenAPIV3 } from 'openapi-types';

export function mergePluginSpecs(plugins: PluginModule[]) {
    for (const plugin of plugins) {
        const basePath = `/plugins/${plugin.name}`;

        if (plugin.routes?.spec) {
            for (const [subpath, def] of Object.entries(plugin.routes.spec)) {
                openApiSpec.paths[`${basePath}${subpath}`] = def as OpenAPIV3.PathItemObject;
            }
        }
    }
}
