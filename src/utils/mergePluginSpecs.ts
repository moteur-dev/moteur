import type { PluginModule } from '@/types/Plugin';
import { openApiSpec } from './openapi';

export function mergePluginSpecs(plugins: PluginModule[]) {
    for (const plugin of plugins) {
        const basePath = `/plugins/${plugin.name}`;

        if (plugin.routes?.spec) {
            for (const [subpath, def] of Object.entries(plugin.routes.spec)) {
                openApiSpec.paths[`${basePath}${subpath}`] = def;
            }
        }
    }
}
