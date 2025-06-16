// types/Plugin.ts

export type PluginSource = 'local' | 'npm'

/**
 * Minimal description of a plugin, used in the global registry
 */
export interface PluginManifest {
  id: string                        // Unique plugin ID (e.g., 'hello-world')
  label: string                     // Human-readable name
  description?: string              // Optional short description
  icon?: string                     // Emoji or icon class
  version?: string                  // Semver (if known)
  source: PluginSource              // Where it's loaded from
}

/**
 * Per-project plugin descriptor, used in project config
 */
export interface PluginDescriptor {
  id: string
  source: PluginSource
  path?: string                     // For local plugins only
  packageName?: string             // For npm plugins only
}

/**
 * Loaded plugin instance (after dynamic loading)
 */
export interface PluginModule {
  name: string
  dataPath: string

  manifest?: PluginManifest
  api?: any                         // Optional developer API extension
  routes?: {
    router: import('express').Router
    spec: any /* Record<string, import('openapi-types').OpenAPIV3.PathItemObject>*/
  }
  storage?: any                     // Optional StorageAdapter export
  tests?: any                       // Optional test exports
}
