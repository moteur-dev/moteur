# 🔧 Moteur Developer API Reference

This reference describes the TypeScript API for reading, writing, and managing Moteur data in projects and namespaces.

> import { Moteur } from 'moteur';

---

## 📁 Projects API

### `Moteur.projects.listProjects(): ProjectSchema[]`
Returns all available projects (based on their `project.json` files).

### `Moteur.projects.getProject(user: User, id: string): ProjectSchema`
Returns a single project config.

### `Moteur.projects.createProject(user: User, project: ProjectSchema): ProjectSchema`
Creates a new project folder with layout and structure directories.

### `Moteur.projects.updateProject(user: User, id: string, patch: Partial<ProjectSchema>): ProjectSchema`
Applies a partial update to a project’s `project.json`.

### `Moteur.projects.deleteProject(user: User, id: string): void`
Soft-deletes: moves a project to `.trash/projects/{id}`.

### `Moteur.projects.validateProject(user: User, id: string, data)

---

## 📄 Layouts API

### `Moteur.layouts.listLayouts(project: string): Layout[]`
Returns all layout definitions for the given project.

### `Moteur.layouts.getLayout(project: string, id: string): Layout`
Loads a single layout JSON by ID.

### `Moteur.layouts.createLayout(project: string, layout: Layout): Layout`
Writes a new layout to the `layouts/` directory in the project.

### `Moteur.layouts.updateLayout(project: string, id: string, patch: Partial<Layout>): Layout`
Applies a partial update to a layout.

### `Moteur.layouts.deleteLayout(project: string, id: string): void`
Moves a layout to `.trash/layouts/{id}.json`.

---

## 🧱 Structures API

### `Moteur.structures.listStructures(project?: string): Record<string, StructureSchema>`
Returns all structure schemas (from global namespaces + project overrides).

### `Moteur.structures.getStructure(id: string, project?: string): StructureSchema`
Resolves a structure by type.

### `Moteur.structures.createStructure(project: string, schema: StructureSchema): StructureSchema`
Creates a structure inside the project-specific structure folder.

### `Moteur.structures.updateStructure(project: string, id: string, patch: Partial<StructureSchema>): StructureSchema`
Updates a structure definition.

### `Moteur.structures.deleteStructure(project: string, id: string): void`
Moves a structure to `.trash/structures/{id}` in the given project.

---

## 📋 Activity API

Read-only access to the activity log (who did what, when). Events are recorded automatically when entries, layouts, pages, structures, models, users, or blueprints are created, updated, or deleted.

### `Moteur.activity.getLog(projectId: string, resourceType: string, resourceId: string): Promise<ActivityEvent[]>`
Returns activity events for a specific resource (newest first).  
`resourceType` is one of: `entry`, `layout`, `page`, `structure`, `model`, `project`, `user`, `blueprint`.  
For entries, use `resourceId` in the form `modelId__entryId` (double underscore).  
For global (user/blueprint) activity, use `projectId: "_system"`.

### `Moteur.activity.getProjectLog(projectId: string, limit?: number, before?: string): Promise<ActivityLogPage>`
Returns a page of activity for the project (newest first). Default `limit` is 50. Use `projectId: "_system"` for global activity.  
**Pagination:** pass `before` (ISO timestamp of the oldest event from the previous page) to load older events. The result includes `events` and optionally `nextBefore` (use as `before` for the next page).

### `Moteur.activity.getGlobalLog(limit?: number, before?: string): Promise<ActivityLogPage>`
Returns a page of global (system) activity: user and blueprint changes. Default `limit` is 50. Supports `before` for pagination (same as `getProjectLog`).

---

## 🧩 Fields API

### `Moteur.fields.loadFields(): Record<string, Field>`
Loads all available field types from namespace directories (`fields/{namespace}`).

---

## 📦 Blocks API

### `Moteur.blocks. loadBlocks(project?: string): Record<string, BlockSchema>`
Loads all block schemas from namespace folders (`blocks/{namespace}`) and optionally from the given project (`projects/{id}/blocks`).

---

## 🔄 Shared Utilities

### `readJson(path: string): any`
Reads a JSON file from disk.

### `writeJson(path: string, data: any): void`
Writes formatted JSON to disk.

### `normalizeType(type: string): string`
Normalizes schema type identifiers (e.g., `core.text` → `core/text`).

