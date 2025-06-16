import path from 'path';
import { pathToFileURL } from 'url';
import { PluginManifest, PluginModule } from '@/types/Plugin';
import { pluginRegistry } from '@/registry/PluginRegistry';
import { error } from 'console';

export async function loadPluginsForProject(pluginIds: string[]): Promise<PluginModule[]> {
    const loaded: PluginModule[] = [];

    for (const id of pluginIds) {
        if (!pluginRegistry.has(id)) {
            throw new Error(`Plugin "${id}" is not available or not registered.`);
        }

        const manifest = pluginRegistry.get(id);
        const plugin = await loadPluginById(manifest);
        loaded.push(plugin);
    }

    return loaded;
}

export async function loadPluginById(manifest: PluginManifest): Promise<PluginModule> {
    const plugin: PluginModule = {
        name: manifest.id,
        dataPath: '',
        manifest
    };

    try {
        if (manifest.source === 'local') {
            const base = path.resolve(`./plugins/${manifest.id}`);

            const tryImport = async (key: keyof PluginModule, file: string) => {
                try {
                    const mod = await import(pathToFileURL(path.join(base, file)).href);
                    plugin[key] = mod?.default ?? mod;
                } catch (error) {
                    console.error(`[plugin:${manifest.id}] Failed to load ${file}`, error);
                }
            };

            await Promise.all([
                tryImport('api', 'api.ts'),
                tryImport('routes', 'routes.ts'),
                tryImport('storage', 'storage.ts'),
                tryImport('tests', 'api.test.ts'),
                tryImport('manifest', 'manifest.ts') // should already be called
            ]);

            plugin.dataPath = path.join(base, 'data');
        }

        // Future: support 'npm' source via manifest.packageName
    } catch (err) {
        console.warn(`[plugin:${manifest.id}] Failed to load`, err);
    }

    return plugin;
}
