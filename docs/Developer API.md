# 🔧 Moteur Developer API Reference

This reference describes the **programmatic TypeScript API** from `@moteur/core` (and `@moteur/types`) for reading, writing, and managing Moteur data. It is not the HTTP REST API; see [REST API.md](REST%20API.md) for that.

> import { Moteur } from '@moteur/core';

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

---

## 🔑 Project API Key (Developer API)

One API key per project. Raw key is never stored; only a hash and prefix. Use for headless/collection access.

### `Moteur.projectApiKey.generate(projectId: string, user: User): Promise<{ rawKey: string; prefix: string }>`
Generates a new project API key. Returns the raw key **once**; store it securely. Throws if the project already has a key (use rotate instead).

### `Moteur.projectApiKey.rotate(projectId: string, user: User): Promise<{ rawKey: string; prefix: string }>`
Replaces the existing key with a new one. Returns the new raw key **once**.

### `Moteur.projectApiKey.revoke(projectId: string, user: User): Promise<void>`
Removes the API key from the project entirely.

---

## 📦 API Collections (Developer API)

Collections define a named, configured view of project data for external consumers (e.g. frontends, static site generators). Stored per project in `api-collections.json`.

### `Moteur.collections.list(projectId: string): Promise<ApiCollection[]>`
Returns all collections for the project.

### `Moteur.collections.get(projectId: string, id: string): Promise<ApiCollection | null>`
Returns a single collection by id, or `null` if not found.

### `Moteur.collections.create(projectId: string, user: User, data: { label: string; description?: string; resources?: ApiCollectionResource[] }): Promise<ApiCollection>`
Creates a new collection.

### `Moteur.collections.update(projectId: string, user: User, id: string, patch: { label?: string; description?: string; resources?: ApiCollectionResource[] }): Promise<ApiCollection>`
Updates a collection (label, description, and/or resources).

### `Moteur.collections.delete(projectId: string, user: User, id: string): Promise<void>`
Hard-deletes a collection (no trash).

---

## 🧭 Navigations API

Navigations are **independent of the page tree**: named, ordered, nested menus (e.g. Header, Footer). Items can link to pages (resolved at read time), custom URLs, assets, or act as dropdown parents with no destination. Custom fields on items use the same field type system as models; schema is defined on the navigation (`itemSchema`). Storage: one file per project, `navigations.json`.

### `Moteur.navigations.list(projectId: string): Promise<Navigation[]>`
Returns all navigations for the project.

### `Moteur.navigations.get(projectId: string, id: string): Promise<Navigation>`
Returns a single navigation by id. Throws if not found.

### `Moteur.navigations.getByHandle(projectId: string, handle: string): Promise<Navigation | null>`
Returns a navigation by handle (e.g. `header`, `footer`), or `null` if not found.

### `Moteur.navigations.create(projectId: string, user: User, data: { name: string; handle: string; maxDepth?: number; itemSchema?: Field[]; items?: NavItem[] }): Promise<Navigation>`
Creates a navigation. Validates: handle unique and URL-safe (lowercase, alphanumeric, hyphens); maxDepth 1–5; item nesting ≤ maxDepth; all `pageId` and `assetId` references exist. Item IDs are generated for items that don’t have one.

### `Moteur.navigations.update(projectId: string, user: User, id: string, patch: Partial<{ name; handle; maxDepth; itemSchema; items }>): Promise<Navigation>`
Updates a navigation. Same validations as create. If `maxDepth` is reduced and existing items exceed the new depth, throws (422); never truncates.

### `Moteur.navigations.delete(projectId: string, user: User, id: string): Promise<void>`
Deletes a navigation.

### `Moteur.navigations.resolve(projectId: string, navigation: Navigation): Promise<ResolvedNavigation>`
Resolves a navigation: hydrates every item’s `url` from page (via urlResolver), custom URL, or asset. Missing page/asset references yield `url: undefined`; never throws.

---

## 📄 Templates API

Templates define the schema for pages (fields) in a project. Storage: `projects/{projectId}/templates/{templateId}.json`.

### `Moteur.templates.listTemplates(projectId: string): Promise<TemplateSchema[]>`
Returns all templates in the project.

### `Moteur.templates.getTemplate(projectId: string, id: string): Promise<TemplateSchema>`
Returns a single template by id (no auth).

### `Moteur.templates.getTemplateWithAuth(user: User, projectId: string, id: string): Promise<TemplateSchema>`
Returns a single template with project access check.

### `Moteur.templates.createTemplate(projectId: string, user: User, data): Promise<TemplateSchema>`
Creates a new template. `data` must include `id`, `label`, `fields` (and optionally `description`). `createdAt`/`updatedAt` are set automatically.

### `Moteur.templates.updateTemplate(projectId: string, user: User, id: string, patch): Promise<TemplateSchema>`
Updates a template with a partial payload.

### `Moteur.templates.deleteTemplate(projectId: string, user: User, id: string): Promise<void>`
Soft-deletes a template (moves to `.trash/templates/{id}.json`).

### `Moteur.templates.validateTemplateById(projectId: string, id: string): Promise<ValidationResult>`
Validates a template by id.

---

## 📃 Pages API

Pages are organized as a **typed page tree**: **static** pages (authored content, one URL each), **collection** pages (bound to a model, one index URL plus one URL per entry), and **folder** nodes (structural grouping, no content). Storage: `projects/{projectId}/pages/{pageId}.json`. List returns a flat array of `PageNode`; the client (or Studio) builds the tree from `parentId` and `order`.

### `Moteur.pages.listPages(projectId: string, options?): Promise<PageNode[]>`
Returns all page nodes (flat). Options: `templateId`, `parentId`, `status` (`'draft' | 'published'`), `type` (`'static' | 'collection' | 'folder'`).

### `Moteur.pages.getPage(projectId: string, id: string): Promise<PageNode>`
Returns a single page node by id.

### `Moteur.pages.getPageWithAuth(user: User, projectId: string, id: string): Promise<PageNode>`
Returns a page with project access check.

### `Moteur.pages.getPageBySlug(projectId: string, slug: string): Promise<PageNode | null>`
Returns a page by slug, or `null` if not found.

### `Moteur.pages.createPage(projectId: string, user: User, data): Promise<PageNode>`
Creates a new page node. `data` must include `type` (`'static' | 'collection' | 'folder'`), `label`, `slug`. For `static`/`collection`: `templateId` required; for `collection`: `modelId` required. Optional: `parentId`, `order`, `navInclude`, `sitemapInclude`, `urlPattern` (collection), etc. Validates slug unique among siblings, no cycles, template/model exist.

### `Moteur.pages.updatePage(projectId: string, user: User, id: string, patch): Promise<PageNode>`
Updates a page. Respects publish guard (approved review required when `project.workflow.requireReview` is enabled).

### `Moteur.pages.deletePage(projectId: string, user: User, id: string): Promise<void>`
Soft-deletes a page. **Throws (409)** if the node has children; move or delete children first.

### `Moteur.pages.reorder(projectId: string, user: User, updates: Array<{ id, parentId, order }>): Promise<PageNode[]>`
Batch update `parentId` and `order` for drag-and-drop. Validates no cycles; applies atomically.

### `Moteur.pages.resolveAllUrls(projectId: string): Promise<ResolvedUrl[]>`
Resolves all URLs for the project (static pages, collection index pages, and one URL per published entry for each collection page with a pattern).

### `Moteur.pages.resolveBreadcrumb(projectId: string, nodeId: string, entryId?: string): Promise<{ url, breadcrumb }>`
Returns the resolved URL and breadcrumb trail (root to current) for a page node, optionally for a specific entry inside a collection page.

### `Moteur.pages.resolveEntryUrl(projectId: string, entryId: string, modelId: string): Promise<string | null>`
Returns the resolved URL for an entry if a collection page is bound to that model and has a `urlPattern`; otherwise `null`. Model schemas may define an optional **`urlPattern`** (e.g. `[post.slug]` or `[category.slug]/[post.slug]`); collection pages use the model's pattern unless overridden by the node's `urlPattern`. Set via `Moteur.projects` / model PATCH; validated on save (warnings only if a referenced field is missing).

### `Moteur.pages.getNavigation(projectId: string, options?): Promise<NavigationNode[]>`
Returns the navigation tree. Options: `depth`, `rootId`. Only nodes with `navInclude`; folders only if they have nav-included descendants.

### `Moteur.pages.validatePageById(projectId: string, id: string): Promise<ValidationResult>`
Validates a page against its template (no-op for folders).

### `Moteur.pages.validateAllPages(projectId: string): Promise<ValidationResult[]>`
Validates all pages in the project.

### Page reviews
Use `Moteur.reviews.submitPage(projectId, user, pageId, assignedTo?)` to submit a page for review. Approve/reject via `Moteur.reviews.approve` / `Moteur.reviews.reject` (same as entries; review records use `resourceType: 'page'`).

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

Field types include **core/asset** (single asset reference with optional usage-level alt/caption) and **core/asset-list** (list of asset references). Use `?resolveAssets=1` on entry and page read endpoints to resolve asset references to full `Asset` objects in `_resolved`.

---

## 📁 Assets API

### `Moteur.assets.upload(projectId, user, file, options?)`
Upload a file (image, video, or document). `file`: `{ buffer, originalName, mimeType }`. `options`: `{ folder?, alt?, title?, credit?, keepLocalCopy? }`.

### `Moteur.assets.list(projectId, options?)`
List assets. `options`: `{ type?, folder?, search? }`.

### `Moteur.assets.get(projectId, id)`
Get a single asset (returns null if not found).

### `Moteur.assets.update(projectId, user, id, patch)`
Update asset metadata (title, alt, caption, description, credit, folder, focalPoint).

### `Moteur.assets.delete(projectId, user, id)`
Delete an asset (does not cascade to entries).

### `Moteur.assets.move(projectId, user, id, folder)`
Move asset to a folder.

### `Moteur.assets.regenerate(projectId, user, assetIds?)`
Regenerate image variants (images only).

### `Moteur.assets.migrateProvider(user, options)`
Migrate video provider (instance-wide). `options`: `{ fromProvider?, toProvider, projectIds?, keepLocalCopy? }`.

### `Moteur.assets.getConfig(projectId, user)`
Get project asset config (variants, adapter, etc.; secrets redacted).

### `Moteur.assets.updateConfig(projectId, user, patch)`
Update project asset config.

---

## 📦 Blocks API

### `Moteur.blocks.loadBlocks(project?: string): Record<string, BlockSchema>`
Loads all block schemas from namespace folders (`blocks/{namespace}`) and optionally from the given project (`projects/{id}/blocks`).

---

## 🔗 Webhooks API

Outbound webhooks notify external HTTPS endpoints when content events occur (entry created/published, asset deleted, review approved, form submitted, etc.). Storage: `projects/{projectId}/webhooks.json` and `webhook-log.json` (delivery log, capped at 500 entries). Secrets are encrypted at rest when `MOTEUR_ENCRYPTION_KEY` is set.

### `Moteur.webhooks.list(projectId: string): Promise<Webhook[]>`
Returns all webhooks for the project. Secrets are redacted (`***`).

### `Moteur.webhooks.get(projectId: string, id: string): Promise<Webhook>`
Returns one webhook by id. Secret is redacted.

### `Moteur.webhooks.create(projectId: string, user: string, data: { name, url, secret?, events?, filters?, headers?, enabled? }): Promise<Webhook>`
Creates a webhook. If `secret` is omitted, a random 32-byte hex secret is generated. **The plaintext secret is returned only in this response;** all subsequent reads redact it. URL must be HTTPS (or HTTP localhost in development). `events`: array of `WebhookEvent`; empty = all events. `filters`: optional array of `{ field, operator, value }` (AND logic).

### `Moteur.webhooks.update(projectId: string, user: string, id: string, patch: Partial<Webhook>): Promise<Webhook>`
Updates a webhook. Secret is redacted in response. If `patch.secret` is provided, it is encrypted and stored.

### `Moteur.webhooks.delete(projectId: string, user: string, id: string): Promise<void>`
Deletes a webhook.

### `Moteur.webhooks.rotateSecret(projectId: string, user: string, id: string): Promise<{ secret: string }>`
Rotates the webhook secret. **The new plaintext secret is returned once.**

### `Moteur.webhooks.test(projectId: string, id: string): Promise<WebhookDelivery>`
Sends a test ping (fake `entry.published` payload with `test: true`). Returns the delivery record after the first attempt.

### `Moteur.webhooks.getLog(projectId: string, webhookId: string, options?: { limit?, offset? }): Promise<WebhookDelivery[]>`
Returns the delivery log for a webhook (newest first). Default limit 50.

### `Moteur.webhooks.retryDelivery(projectId: string, webhookId: string, deliveryId: string): Promise<void>`
Requeues a failed delivery. **422** if delivery status is not `failed`.

### `Moteur.webhooks.dispatch(event: WebhookEvent, data: WebhookPayloadData, context: { projectId, environment?, source: 'studio' | 'api' | 'scheduler' }): Promise<void>`
Dispatches an event to all matching webhooks (fire-and-forget). Used internally by entry, asset, review, comment, and page services. Never throws; delivery is asynchronous.

---

## 🔄 Shared Utilities

### `readJson(path: string): any`
Reads a JSON file from disk.

### `writeJson(path: string, data: any): void`
Writes formatted JSON to disk.

### `normalizeType(type: string): string`
Normalizes schema type identifiers (e.g., `core.text` → `core/text`).

