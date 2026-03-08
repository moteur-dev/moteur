# REST API Reference

This document describes the **currently implemented** HTTP API. All paths are relative to the API base path (e.g. empty or `/api` via `API_BASE_PATH`). Authentication uses JWT (Bearer token) or **project API key** for collection endpoints (see Collections).

**Response convention:** List endpoints return a wrapper object `{ resourceName: T[] }` or a bare array where noted. Single-resource endpoints return `{ resourceName: T }` or `{ token, user }` for auth. Errors return `{ error: string }`.

**Project API key (one per project):** For collection endpoints you can send the key in header `x-api-key` or query `?apiKey=...`. Key auth is **read-only** (GET only); non-GET requests with only an API key return 403. JWT and API key can coexist; JWT takes precedence.

**Webhooks (no auth):** `POST /webhooks/mux` and `POST /webhooks/vimeo` are mounted at the application level (outside admin auth). Requests are verified using the provider’s webhook signature; invalid signatures receive **400**. Register the URLs in the Mux/Vimeo dashboard and set the corresponding secrets in env. Processing is asynchronous after responding **200**.

**Request logging & rate limiting:** All API requests are classified as **admin** or **public**. Counts are kept in two separate buckets so you can audit and apply different limits (e.g. no limit on admin, per-project limit on public). See [Request logging, rate limiting, and security](#-request-logging-rate-limiting-and-security) below. For a single list of env vars, see [Configuration](Configuration.md).

---

## 🔐 Auth (no JWT required for login)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Log in. Body: `{ email, password }`. Returns `{ token, user }`. |
| GET | `/auth/providers` | List auth providers. Returns `{ providers }`. |
| POST | `/auth/refresh` | Refresh JWT. Returns `{ token }`. |
| GET | `/auth/me` | Current user (requires JWT). Returns `{ user }` with projects. |
| GET | `/auth/github` | GitHub OAuth (if enabled). |
| GET | `/auth/github/callback` | GitHub OAuth callback. |
| GET | `/auth/google` | Google OAuth (if enabled). |
| GET | `/auth/google/callback` | Google OAuth callback. |

---

## 📁 Projects

All project endpoints require JWT. Project list/get/update/delete may require admin or project access depending on implementation.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects (admin). Returns `{ projects }`. |
| GET | `/projects/:projectId` | Get one project. Returns `{ project }`. |
| POST | `/projects` | Create a project. Body may include `blueprintId`. Returns created project. |
| PATCH | `/projects/:projectId` | Update a project. Returns `{ project }`. |
| DELETE | `/projects/:projectId` | Delete a project. |
| GET | `/projects/:projectId/users` | List users with access to the project. Returns `{ users }`. |

---

## 📋 Activity

Activity events are recorded when entries, layouts, structures, models, users, or blueprints are created, updated, or deleted.

**Project-scoped** (JWT + project access):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/activity` | Page of activity. Query: `limit` (default 50, max 200), `before` (ISO timestamp for next page). Response: `{ events, nextBefore? }`. |
| GET | `/projects/:projectId/activity/:resourceType/:resourceId` | Activity for one resource (newest first). |

**Global** (admin only):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activity` | Page of global activity. Query: `limit`, `before`. Response: `{ events, nextBefore? }`. |

**`resourceType`:** `entry`, `layout`, `page`, `structure`, `model`, `project`, `user`, `blueprint`.  
For entries, **`resourceId`** is `modelId__entryId`. Global events have `projectId: "_system"`.

---

## 📦 Collections (Public API)

Named views of project data for external consumers. Authenticate with **project API key** (header `x-api-key` or query `apiKey`) or JWT. Default status filter is **published** when using API key only; with JWT the collection’s status filter is respected.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/collections` | List collections. Returns array of collections. |
| GET | `/projects/:projectId/collections/:collectionId` | Get one collection. |
| GET | `/projects/:projectId/collections/:collectionId/:resourceId/entries` | List entries for a model resource. Pipeline: status filter → reference resolution → field selection. |
| GET | `/projects/:projectId/collections/:collectionId/:resourceId/entries/:id` | One entry. Same pipeline. |
| GET | `/projects/:projectId/collections/:collectionId/pages` | List pages (filtered by collection page resource). |
| GET | `/projects/:projectId/collections/:collectionId/pages/:id` | One page by id. |
| GET | `/projects/:projectId/collections/:collectionId/pages/by-slug/:slug` | One page by slug. |

**Field selection:** Collection resources can define `fields: string[]`; only those top-level field names are returned. Omit or empty = all fields.

**Status filter:** Per resource, `filters.status` (default `['published']`). With API key only, only published content is returned.

**Reference resolution:** Per resource, `resolve: 0 | 1 | 2` controls how deep reference-like values (`{ id, type }`) in entry data are expanded.

**Entry URL resolution:** Add `?resolveUrl=1` to entry list or get-one endpoints (collections or project models) to include a computed **`resolvedUrl`** on each entry when a collection page is bound to that model and has a URL pattern. Never stored.

---

## 🌐 Public — Page outputs (sitemap, navigation, urls, breadcrumb)

Unauthenticated, project-scoped. Used by frontends and static site generators.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/sitemap.xml` | XML sitemap. Includes all resolved URLs with `sitemapInclude`; collection entries expanded when `sitemapIncludeEntries` is true. Uses `project.siteUrl` as base for `<loc>` if set; otherwise path-only. |
| GET | `/projects/:projectId/sitemap.json` | Same as sitemap.xml but JSON array of `ResolvedUrl[]` (sitemap-included only). |
| GET | `/projects/:projectId/navigation` | Navigation tree. Query: `depth?`, `rootId?`. Returns `NavigationNode[]` (only `navInclude` nodes; folders only if they have nav-included descendants). |
| GET | `/projects/:projectId/urls` | Flat list of all resolved URLs (static + collection-expanded). |
| GET | `/projects/:projectId/breadcrumb` | Query: **`pageId`** (required), `entryId?`. Returns `{ url, breadcrumb: [{ label, url, nodeId, entryId? }] }` from root to current. |

---

## 🧭 Public — Navigations

Unauthenticated. Navigations are **independent of the page tree**: named, ordered, nested menus (e.g. Header, Footer). Items can link to pages, custom URLs, assets, or act as dropdown parents. Resolution happens at read time; page and asset URLs are hydrated. Missing page/asset references do not fail the request — the item’s `url` is `undefined`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/navigations` | All navigations, fully resolved (`ResolvedNavigation[]`). |
| GET | `/projects/:projectId/navigations/:handle` | One navigation by **handle** (e.g. `header`, `footer`). Returns `ResolvedNavigation`. 404 if handle not found. |

---

## 🗒 Public — Forms

Unauthenticated, project-scoped. Used by frontend form components.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/forms/:formId` | Get public form metadata (fields, labels, successMessage). Omits actions, notifications, recaptcha. 403 if inactive. |
| POST | `/projects/:projectId/forms/:formId/submit` | Submit a form. Accepts JSON or urlencoded body. Honeypot: include a `_honeypot` field (must be empty for real users). Locale: pass as `_locale` in body or `?locale=` query param. Returns `{ success, submissionId, message, redirectUrl? }`. Rate limited: 60/15min per form (env: `API_RATE_LIMIT_FORMS_MAX`). |

---

## 💬 Comments

Stored per project. All require JWT + project access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/:projectId/comments` | Create a comment. Body: `{ resourceType, resourceId, fieldPath?, blockId?, parentId?, body }`. Returns created comment. |
| GET | `/projects/:projectId/comments` | List comments. Query: `resourceType`, `resourceId` (required), `fieldPath?`, `includeResolved?` (default false). Returns `{ comments }`. |
| PATCH | `/projects/:projectId/comments/:id` | Edit comment. Body: `{ body }`. Author only. Returns updated comment. |
| POST | `/projects/:projectId/comments/:id/resolve` | Mark resolved. Returns updated comment. |
| DELETE | `/projects/:projectId/comments/:id` | Delete comment. Author or admin. Returns 204. |

`resourceType` is `entry` or `layout`. For entries, `resourceId` is `modelId__entryId`. Comment body length limit: `COMMENTS_MAX_BODY_LENGTH` (default 10000).

---

## 📋 Review & Approval Workflow

Requires `project.workflow.enabled`. Approve/reject require `reviewer` or `admin` role. See [Workflows.md](Workflows.md).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/:projectId/models/:modelId/entries/:entryId/submit-review` | Submit for review. Body: `{ assignedTo?: string }`. Returns `{ review }`. |
| GET | `/projects/:projectId/reviews` | List reviews. Query: `modelId?`, `entryId?`, `status?` (pending \| approved \| rejected). Returns `{ reviews }`. |
| GET | `/projects/:projectId/reviews/:reviewId` | Get one review. Returns `{ review }`. |
| POST | `/projects/:projectId/reviews/:reviewId/approve` | Approve (reviewer/admin). Returns `{ review }`. |
| POST | `/projects/:projectId/reviews/:reviewId/reject` | Reject. Body: `{ reason: string }`. Returns `{ review }`. |

---

## 🔔 Notifications

Per-project notifications for review events. JWT + project access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/notifications` | List for current user. Query: `unreadOnly?` (default true). Returns `{ notifications }`. |
| POST | `/projects/:projectId/notifications/:id/read` | Mark as read. Returns updated notification. |
| POST | `/projects/:projectId/notifications/read-all` | Mark all read. Returns 204. |

---

## 📐 Blueprints (global)

Global templates (project, model, or structure). Stored under `data/blueprints/<kind>/` (override: `BLUEPRINTS_DIR`). See [Blueprints.md](Blueprints.md). All require admin.

**Project blueprints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blueprints/projects` | List project blueprints. Returns `{ blueprints }`. |
| GET | `/blueprints/projects/:id` | Get one. Returns `{ blueprint }`. |
| POST | `/blueprints/projects` | Create. Body: full blueprint JSON. |
| PATCH | `/blueprints/projects/:id` | Partial update. |
| DELETE | `/blueprints/projects/:id` | Delete. |

**Model blueprints:** Same pattern under `/blueprints/models` and `/blueprints/models/:id`.

**Structure blueprints:** Same pattern under `/blueprints/structures` and `/blueprints/structures/:id`.

---

## 📁 Webhooks (signature-verified, no JWT)

These endpoints are called by the video providers. They are **not** under `/admin` and do not require JWT. Signature verification is performed first; on failure the response is **400** with no side effects. On success the server responds **200** immediately and processes the payload asynchronously.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/mux` | Mux webhook. Header: `mux-signature`. Configure URL and signing secret in Mux dashboard. |
| POST | `/webhooks/vimeo` | Vimeo webhook. Header: `x-vimeo-signature` or `vimeo-signature`. Configure URL and secret in Vimeo. |

---

## 🔗 Admin — Webhooks (outbound)

JWT + project access. Outbound webhooks POST a signed JSON payload to your HTTPS endpoint when content events occur (entry published, asset deleted, review approved, etc.). Register an endpoint; Moteur delivers events asynchronously with retries.

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/projects/:projectId/webhooks` | List webhooks. Secrets redacted. Returns `Webhook[]`. |
| POST | `/admin/projects/:projectId/webhooks` | Create. Body: `{ name, url, secret?, events?, filters?, headers?, enabled? }`. **Secret visible in this response only.** 422 if validation fails (e.g. URL not HTTPS). |
| GET | `/admin/projects/:projectId/webhooks/:webhookId` | Get one. Secret redacted. |
| PATCH | `/admin/projects/:projectId/webhooks/:webhookId` | Update. Secret redacted. 422 if validation fails. |
| DELETE | `/admin/projects/:projectId/webhooks/:webhookId` | Delete. 204. |
| POST | `/admin/projects/:projectId/webhooks/:webhookId/rotate-secret` | Rotate secret. Returns `{ secret: string }` (new plaintext, shown once). |
| POST | `/admin/projects/:projectId/webhooks/:webhookId/test` | Send test ping. Returns `WebhookDelivery` (result of first attempt). |
| GET | `/admin/projects/:projectId/webhooks/:webhookId/log` | Delivery log. Query: `limit?` (default 50), `offset?`. Returns `WebhookDelivery[]`. |
| POST | `/admin/projects/:projectId/webhooks/:webhookId/log/:deliveryId/retry` | Retry a failed delivery. 204. 422 if delivery status is not `failed`. |

**Payload envelope:** Every delivery sends a POST body with `Content-Type: application/json` and this shape:

```json
{
  "id": "<delivery-uuid>",
  "event": "entry.published",
  "timestamp": "2025-03-08T12:00:00.000Z",
  "projectId": "site1",
  "environment": "production",
  "source": "studio",
  "data": { "entryId": "...", "modelId": "...", "status": "published", "updatedBy": "..." }
}
```

Event types include: `entry.created`, `entry.updated`, `entry.published`, `entry.unpublished`, `entry.deleted`, `asset.created`, `asset.updated`, `asset.deleted`, `page.published`, `page.unpublished`, `page.deleted`, `review.submitted`, `review.approved`, `review.rejected`, `comment.created`, `form.submitted`. The `data` object shape depends on the event (see types in `@moteur/types/Webhook`).

**Headers:** Each request includes:

- `Content-Type: application/json`
- `X-Moteur-Event`: event name
- `X-Moteur-Delivery`: delivery id
- `X-Moteur-Signature`: `sha256=<HMAC-SHA256(secret, rawBody)>`
- `X-Moteur-Timestamp`: Unix timestamp (seconds)
- Any custom headers configured on the webhook

**Verifying the signature (consumer):** Use the webhook secret and the raw request body (string). Compute `HMAC-SHA256(secret, rawBody)` and compare with the value after `sha256=` in `X-Moteur-Signature` (timing-safe compare recommended).

Node.js example:

```js
const crypto = require('crypto');
function verifySignature(secret, rawBody, signatureHeader) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}
```

Python example:

```py
import hmac
import hashlib

def verify_signature(secret: bytes, raw_body: bytes, signature_header: str) -> bool:
    expected = "sha256=" + hmac.new(secret, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature_header, expected)
```

**Retry schedule:** On non-2xx or network error, Moteur retries with exponential backoff: attempt 2 after 30s, 3 after 5min, 4 after 30min, 5 after 2hr. After 5 attempts the delivery is marked `failed` and can be retried manually via the API or Studio. Retries are in-process (`setTimeout`); they are lost on server restart.

---

## 🗒 Admin — Forms

JWT + project access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/projects/:projectId/forms` | List forms. Returns `{ forms }`. |
| GET | `/admin/projects/:projectId/forms/:formId` | Get one form (full schema incl. actions, notifications). Returns `{ form }`. |
| POST | `/admin/projects/:projectId/forms` | Create a form. Returns `{ form }`. 422 if validation fails. |
| PATCH | `/admin/projects/:projectId/forms/:formId` | Update a form. Returns `{ form }`. |
| DELETE | `/admin/projects/:projectId/forms/:formId` | Soft-delete. 204. |
| GET | `/admin/projects/:projectId/forms/:formId/submissions` | List submissions. Query: `status?`, `limit?` (default 50). Returns `{ submissions }`. |
| GET | `/admin/projects/:projectId/forms/:formId/submissions/:submissionId` | Get one submission. Returns `{ submission }`. |
| DELETE | `/admin/projects/:projectId/forms/:formId/submissions/:submissionId` | Soft-delete. 204. |

---

## 📊 Admin — Usage (request counts)

JWT + admin only. Returns current request counts in two buckets: **admin** (global) and **public** (per project). Use for audit and future billing/limits.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/usage` | Returns `{ admin: { total, windowStart }, public: { byProject: { [projectId]: { total, windowStart } } } }`. |

---

## 🔑 Admin — Project API Key

JWT + project access. One key per project. Raw key is returned only on generate/rotate and never again.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/projects/:projectId/api-key/generate` | Generate key. Body: none. Returns `{ prefix, rawKey, message }`. Store rawKey securely. |
| POST | `/admin/projects/:projectId/api-key/rotate` | Rotate key. Returns new `{ prefix, rawKey, message }`. |
| DELETE | `/admin/projects/:projectId/api-key` | Revoke key. 204. |
| GET | `/admin/projects/:projectId/api-key` | Key metadata only: `{ prefix, createdAt }` (never raw or hash). |

---

## 📦 Admin — Collections

JWT + project access. CRUD for API collections (define which models/pages and field/status/resolve options are exposed).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/projects/:projectId/collections` | List collections. |
| GET | `/admin/projects/:projectId/collections/:id` | Get one. |
| POST | `/admin/projects/:projectId/collections` | Create. Body: `{ label, description?, resources? }`. |
| PATCH | `/admin/projects/:projectId/collections/:id` | Update. |
| DELETE | `/admin/projects/:projectId/collections/:id` | Hard delete. 204. |

---

## 📄 Admin — Pages

JWT + project access. Pages are a **typed tree**: **static** (authored content), **collection** (bound to a model, N URLs per entries), **folder** (structure only). List returns a flat array of `PageNode`; client builds tree from `parentId` and `order`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/projects/:projectId/pages` | List all page nodes. Query: `templateId?`, `parentId?`, `status?` (draft \| published), `type?` (static \| collection \| folder). |
| POST | `/admin/projects/:projectId/pages` | Create. Body: `type`, `label`, `slug`; for static/collection: `templateId`; for collection: `modelId`; optional `parentId`, `urlPattern`, `navInclude`, `sitemapInclude`, etc. Returns `PageNode`. 409 if slug conflict among siblings; 422 if validation fails (cycle, unknown template/model). |
| GET | `/admin/projects/:projectId/pages/:id` | Get one. |
| PATCH | `/admin/projects/:projectId/pages/:id` | Update. Same validations as create. |
| DELETE | `/admin/projects/:projectId/pages/:id` | Soft-delete. **409** if node has children (move or delete children first). 204 on success. |
| POST | `/admin/projects/:projectId/pages/reorder` | Batch reorder. Body: `[{ id, parentId, order }]`. Returns updated `PageNode[]`. Used by Studio drag-and-drop. |
| PATCH | `/admin/projects/:projectId/pages/:id/status` | Set status. Body: `{ status: 'draft' | 'published' }`. |
| POST | `/admin/projects/:projectId/pages/:id/submit-review` | Submit for review. |
| POST | `/admin/projects/:projectId/pages/validate-all` | Validate all pages. |
| POST | `/admin/projects/:projectId/pages/:id/validate` | Validate one page. |

---

## 🧭 Admin — Navigations

JWT + project access. Navigations are named menus with nested items; items link to pages, custom URLs, assets, or have no destination (dropdown parent). Handle is URL-safe and unique per project.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/projects/:projectId/navigations` | List all navigations. Returns `Navigation[]`. |
| POST | `/admin/projects/:projectId/navigations` | Create. Body: `{ name, handle, maxDepth?, itemSchema?, items? }`. **409** if handle exists. **422** if validation fails (depth, pageId/assetId not found, handle not URL-safe). |
| GET | `/admin/projects/:projectId/navigations/:id` | Get one. |
| PATCH | `/admin/projects/:projectId/navigations/:id` | Update. **422** if new `maxDepth` is lower than current deepest item depth (never truncate). |
| DELETE | `/admin/projects/:projectId/navigations/:id` | Delete. 204. |

---

## 🗃️ Models

Under a project. JWT + project access. Path param: `projectId`, `modelId`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/models` | List model schemas. Returns `{ models }`. |
| GET | `/projects/:projectId/models/:modelId` | Get one. Returns `{ model }`. |
| POST | `/projects/:projectId/models` | Create. Body: full model schema, or **blueprintId** (model blueprint id) plus optional overrides (e.g. id, label). Returns created model. |
| PATCH | `/projects/:projectId/models/:modelId` | Update. Body may include **`urlPattern`** (e.g. `[post.slug]`) for collection page URL generation. Returns updated model; if `urlPattern` was sent and any `[field.path]` reference does not exist on the model, response includes **`urlPatternWarnings`** (array of strings). Validation is warning-only. |
| DELETE | `/projects/:projectId/models/:modelId` | Delete. |

---

## 📁 Entries

Under a project and model. JWT + project access. Path param: `projectId`, `modelId`, `entryId`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/models/:modelId/entries` | List entries. Returns `{ entries }`. Query: **`?resolveUrl=1`** to add computed `resolvedUrl` when a collection page is bound to this model. |
| GET | `/projects/:projectId/models/:modelId/entries/:entryId` | Get one. Returns `{ entry }`. Query: **`?resolveUrl=1`** to add computed `resolvedUrl`. |
| POST | `/projects/:projectId/models/:modelId/entries` | Create. Returns created entry. |
| PATCH | `/projects/:projectId/models/:modelId/entries/:entryId` | Update. Returns `{ entry }`. |
| DELETE | `/projects/:projectId/models/:modelId/entries/:entryId` | Delete. |
| POST | `/projects/:projectId/models/:modelId/entries/:entryId/submit-review` | Submit for review (see Workflow). |
| PATCH | `/projects/:projectId/models/:modelId/entries/:entryId/status` | Set status. Body: `{ status: 'draft' | 'in_review' | 'published' | 'unpublished' }`. Admin can bypass review when `workflow.requireReview` is enabled. |

---

## 🤖 AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/generate-entry` | Generate entry (project access). |
| POST | `/ai/generate-fields` | Generate fields (admin). |
| POST | `/ai/generate-image` | Generate image (auth). |

---

## 👁 Presence (debug)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/presence/debug` | Debug presence state. |
| DELETE | `/projects/presence/form-state/:screenId` | Clear form state. |

---

## 📄 OpenAPI

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `{basePath}/openapi.json` | OpenAPI 3 spec. |
| (UI) | `/docs` | Swagger UI. |

---

## 🛡 Request logging, rate limiting, and security

**Classification:** Every request is classified as **admin** or **public**. Admin = any path under `/admin/`. Public = project-scoped read endpoints: `/projects/:projectId/collections/*`, `/projects/:projectId/pages`, `/projects/:projectId/templates`. Counts are stored in two separate places so limits can differ (e.g. no limit on admin, per-project limit on public).

**Audit log:** If `API_REQUEST_LOG_FILE` (absolute path) or `API_REQUEST_LOG_DIR` is set, each admin and public request is appended as a JSON line (timestamp, type, projectId, method, path, statusCode, durationMs). **API key and Authorization header are never logged.** Use log rotation (e.g. logrotate) and retain logs as needed for audit or billing disputes.

**Rate limiting:**

| Scope | Key | Default | Env |
|-------|-----|---------|-----|
| Admin | IP | 10000 / 15 min (effectively off) | `API_RATE_LIMIT_ADMIN_MAX` |
| Public | projectId | 1000 / 15 min per project | `API_RATE_LIMIT_PUBLIC_MAX` |

When exceeded, response is **429** with `{ error: "Too many requests..." }`. Set env to `0` to keep default (admin: high, public: 1000). For multiple API instances, use a shared store (e.g. Redis) with express-rate-limit; see the package docs.

**Security:** [Helmet](https://helmetjs.github.io/) is enabled by default (security headers). Set `HELMET_DISABLED=1` to disable (e.g. local Swagger). Set `HELMET_CSP_DISABLED=1` to disable Content-Security-Policy only. Request body size is limited by `API_BODY_LIMIT` (default `1mb`).

**Billing / long-term counts:** In-memory counts reset on restart. To recalculate from the audit log (e.g. for billing or monthly reports), run the recalculation script on the same log file:

```bash
# From repo root (log path as arg or via API_REQUEST_LOG_FILE / API_REQUEST_LOG_DIR)
npx tsx packages/api/scripts/recalculate-usage.ts /var/log/api-requests.log
# Optional: bucket by day or month
USAGE_WINDOW=month npx tsx packages/api/scripts/recalculate-usage.ts /var/log/api-requests.log
```

Output is JSON: `{ source, window, totals: { [windowKey]: { admin, public: { [projectId]: count } } } }`. Use `USAGE_WINDOW=day` or `USAGE_WINDOW=month` to get per-period breakdowns.

---

## 📌 Planned (not yet mounted)

The following are **not** currently mounted; they may be added in a future release:

- **Public API (headless):** read-only layouts, structures, model entries, blocks/fields list, preview (no auth).
- **Layout CRUD:** list/create/update/delete layouts under a project.
- **Structure CRUD:** list/create/update/delete structures under a project.
- **Admin blocks/fields:** global block/field type management and utilities (validate, render-preview, usage).

Until then, use the **Developer API** ([Developer API.md](Developer%20API.md)) from `@moteur/core` for layouts and structures.
