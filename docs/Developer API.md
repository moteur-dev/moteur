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

## 💬 Comments API

Comments can be attached to entries (top-level or specific fields) and layouts (including specific blocks). They are threaded (one level of replies), resolvable, and broadcast in real time via the presence WebSocket.

### `Moteur.comments.add(projectId: string, user: User, input: CommentInput): Promise<Comment>`
Creates a new comment. `input` must include `resourceType` (`'entry'` \| `'layout'`), `resourceId` (e.g. `modelId__entryId` for entries, `layoutId` for layouts), and `body` (plain text). Optional: `fieldPath`, `blockId`, `parentId` (for replies; one level deep only).

### `Moteur.comments.get(projectId: string, resourceType: string, resourceId: string, options?: GetCommentsOptions): Promise<Comment[]>`
Returns comments for a resource. `options.includeResolved` (default `false`) includes resolved comments; `options.fieldPath` filters by field path.

### `Moteur.comments.resolve(projectId: string, user: User, commentId: string): Promise<Comment>`
Marks a comment as resolved. Any project member can resolve. Sets `resolvedBy` and `resolvedAt`.

### `Moteur.comments.delete(projectId: string, user: User, commentId: string): Promise<void>`
Hard-deletes a comment. Only the author or an admin can delete.

### `Moteur.comments.edit(projectId: string, user: User, commentId: string, body: string): Promise<Comment>`
Edits the comment body. Only the author can edit. Updates `updatedAt`.

---

## 📋 Reviews API

Review & approval workflow: submit entries for review, approve (auto-publish), or reject (entry returns to draft with a Comment as the rejection reason). Requires `project.workflow.enabled`. Reviewer or admin role is required for approve/reject.  
**Full guide:** [Workflows.md](Workflows.md) — how it works, modes, roles, publish guard.

### `Moteur.reviews.submit(projectId: string, user: User, modelId: string, entryId: string, assignedTo?: string): Promise<Review>`
Submits an entry for review. Sets entry status to `in_review` and creates a Review. Optionally assign to a specific reviewer (`assignedTo` = userId). Notifies reviewers (or `assignedTo`) and logs activity.

### `Moteur.reviews.approve(projectId: string, user: User, reviewId: string): Promise<Review>`
Approves a review. Only users with `reviewer` or `admin` role. In `auto_publish` mode, sets entry status to `published`. Resolves the Review and notifies the requester.

### `Moteur.reviews.reject(projectId: string, user: User, reviewId: string, reason: string): Promise<Review>`
Rejects a review. Only users with `reviewer` or `admin` role. Creates a Comment on the entry with `reason` as the body, sets entry status back to `draft`, and stores the comment ID in `Review.rejectionCommentId`. Notifies the requester.

### `Moteur.reviews.get(projectId: string, options?: { modelId?: string; entryId?: string; status?: 'pending' | 'approved' | 'rejected' }): Promise<Review[]>`
Returns reviews for the project, optionally filtered by `modelId`, `entryId`, or `status`.

### `Moteur.reviews.getOne(projectId: string, reviewId: string): Promise<Review | null>`
Returns a single review by ID, or `null` if not found.

---

## 🔔 Notifications API

In-studio notifications for review events (e.g. “review requested”, “approved”, “rejected”). Stored per project in `notifications.json`.

### `Moteur.notifications.get(projectId: string, userId: string, unreadOnly?: boolean): Promise<Notification[]>`
Returns notifications for the user in the project. Default `unreadOnly` is `true`.

### `Moteur.notifications.markRead(projectId: string, userId: string, notificationId: string): Promise<Notification>`
Marks a notification as read. Returns the updated notification.

### `Moteur.notifications.markAllRead(projectId: string, userId: string): Promise<void>`
Marks all notifications for the user in the project as read.

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

