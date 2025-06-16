import path from 'path'
import { pathToFileURL } from 'url'
import { PluginManifest, PluginModule } from '@/types/Plugin'
import { pluginRegistry } from '@/registry/PluginRegistry'

export async function loadPluginById(manifest: PluginManifest): Promise<PluginModule> {
  const mod: PluginModule = { name: manifest.id, dataPath: '', manifest }

  try {
    if (manifest.source === 'local') {
      const base = path.resolve(`./plugins/${manifest.id}`)

      const tryImport = async (key: keyof PluginModule, file: string) => {
        try {
          const m = await import(pathToFileURL(path.join(base, file)).href)
          mod[key] = m?.default ?? m
        } catch {}
      }

      await Promise.all([
        tryImport('routes', 'routes.ts'),
        tryImport('api', 'api.ts'),
        tryImport('storage', 'storage.ts'),
        tryImport('tests', 'api.test.ts'),
        tryImport('manifest', 'manifest.ts'),
      ])

      mod.dataPath = path.join(base, 'data')
    }

    // (future) npm plugins use manifest.packageName instead
  } catch (err) {
    console.warn(`[plugin:${manifest.id}] failed to load`, err)
  }

  return mod
}

/**
 * Loads all enabled plugins for a project by plugin ID
 */
export async function loadPluginsForProject(pluginIds: string[]): Promise<PluginModule[]> {
  const loaded: PluginModule[] = []

  for (const id of pluginIds) {
    if (!pluginRegistry.has(id)) {
      throw new Error(`Plugin "${id}" is not available or not registered.`)
    }

    const manifest = pluginRegistry.get(id)
    const plugin = await loadPluginById(manifest)
    loaded.push(plugin)
  }

  return loaded
}
