# REST API Reference

This document describes the **currently implemented** HTTP API. All paths are relative to the API base path (e.g. empty or `/api` via `API_BASE_PATH`). Authentication uses JWT (Bearer token) unless noted.

**Response convention:** List endpoints return a wrapper object `{ resourceName: T[] }`. Single-resource endpoints return `{ resourceName: T }` or `{ token, user }` for auth. Errors return `{ error: string }`.

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

Global project templates. Stored under `data/blueprints/` (override: `BLUEPRINTS_DIR`). See [Blueprints.md](Blueprints.md). All require admin.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blueprints` | List blueprints. Returns `{ blueprints }`. |
| GET | `/blueprints/:blueprintId` | Get one. Returns `{ blueprint }`. |
| POST | `/blueprints` | Create or replace. Body: full blueprint JSON. |
| PATCH | `/blueprints/:blueprintId` | Partial update. |
| DELETE | `/blueprints/:blueprintId` | Delete. |

---

## 🗃️ Models

Under a project. JWT + project access. Path param: `projectId`, `modelId`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/models` | List model schemas. Returns `{ models }`. |
| GET | `/projects/:projectId/models/:modelId` | Get one. Returns `{ model }`. |
| POST | `/projects/:projectId/models` | Create. Returns created model. |
| PATCH | `/projects/:projectId/models/:modelId` | Update. Returns `{ model }`. |
| DELETE | `/projects/:projectId/models/:modelId` | Delete. |

---

## 📁 Entries

Under a project and model. JWT + project access. Path param: `projectId`, `modelId`, `entryId`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:projectId/models/:modelId/entries` | List entries. Returns `{ entries }`. |
| GET | `/projects/:projectId/models/:modelId/entries/:entryId` | Get one. Returns `{ entry }`. |
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

## 📌 Planned (not yet mounted)

The following are **not** currently mounted; they may be added in a future release:

- **Public API (headless):** read-only layouts, structures, model entries, blocks/fields list, preview (no auth).
- **Layout CRUD:** list/create/update/delete layouts under a project.
- **Structure CRUD:** list/create/update/delete structures under a project.
- **Admin blocks/fields:** global block/field type management and utilities (validate, render-preview, usage).

Until then, use the **Developer API** ([Developer API.md](Developer%20API.md)) from `@moteur/core` for layouts and structures.
