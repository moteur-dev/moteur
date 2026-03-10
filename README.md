# Moteur

**Moteur** is a framework-agnostic content engine for structured, multilingual content. Use it as a **headless CMS**: define models and pages, edit content in **Moteur Studio**, and consume data via a **REST API** or the **Developer API** from any frontend or static site generator.

- **Content API** — Collections, pages, entries, navigations, sitemaps; read-only **project API key** for frontends and SSG.
- **Admin API** — Full CRUD with JWT; manage projects, models, entries, templates, blueprints, webhooks.
- **Moteur Studio** — Web UI to create and manage projects, content types, pages, and entries.
- **Starters** — Official starters for Next.js, Astro, Eleventy, and more (see [Starters](docs/Starters.md)).

Storage is flat JSON files (no database). Optional **blueprints** and **seeds** get you from zero to a content model in one command.

---

## Quick start

1. **Install and build** (from the `moteur` directory):
   ```bash
   pnpm install && pnpm run build
   ```

2. **Seed blueprints** (optional — copies seed files into `data/blueprints/` when missing):
   ```bash
   pnpm run seed
   # Or overwrite existing: pnpm run seed:force
   ```

3. **Run the API**:
   ```bash
   pnpm run server:dev
   ```
   API base URL: `http://localhost:3000` (or with `API_BASE_PATH`, e.g. `http://localhost:3000/api`).

4. **Run Moteur Studio** (from `moteur-admin`): create projects, models, templates, pages, and entries from the UI.
   ```bash
   cd ../moteur-admin && pnpm install && pnpm run dev
   ```
   Open http://localhost:5173 and point it at your API (e.g. `VITE_API_URL=http://localhost:3000`).

---

## Core concepts

### Projects

The top-level unit. Everything in Moteur is scoped to a **project**: models, entries, layouts, structures, templates, and pages live inside a project. Projects can be created from a **project blueprint** (optional) to apply initial models, layouts, and structures.

### Collections (Public API)

A **Collection** is a named, configured view of project data for your frontend or SSG. Each project has one **API key**. Collections define which models and pages that key can read, with optional field selection, status filters, and reference resolution. Key auth is **read-only** (GET only). See [Public API and Collections](docs/Public%20API%20and%20Collections.md) for setup, [REST API](docs/REST%20API.md) for endpoints, and [Developer API](docs/Developer%20API.md) for programmatic access.

### Blueprints

Reusable templates with a **kind**. Stored under `data/blueprints/<kind>/`.

| Kind | Purpose |
|------|---------|
| **project** | Apply initial models, layouts, structures when creating a new project. |
| **model** | Create a model in a project from a predefined schema (e.g. Blog Post, Basic Page). |
| **structure** | Create a project structure from a predefined schema (e.g. Publishable, SEO). |
| **template** | Create a page template in a project from a predefined schema (e.g. Landing, Article). |

Create and edit blueprints in **Studio** (Blueprints section) or via the REST API. When creating a model, structure, or template, pass `blueprintId` to instantiate from a blueprint.

### Models & Entries

- **Models** define the schema for a content type (e.g. Product, Article): id, label, description, and **fields**.
- **Entries** are instances of a model, with workflow status (draft, in_review, published) and validation.

### Structures

Reusable bundles of fields (e.g. Publishable, SEO, Team Member). They have a `type` (e.g. `project/seo`), label, and `fields`. Use structure blueprints to add common structures quickly.

### Templates & Pages

- **Templates** (page templates) define the schema for a page: id, label, description, and **fields**.
- **Pages** form a **typed page tree**:
  - **Static pages** — one URL each; created from a template.
  - **Collection pages** — bound to a **model**; index URL plus one URL per published entry (e.g. `[post.slug]`).
  - **Folder nodes** — grouping only; no content, no URL.

The tree drives **sitemap**, **navigation**, **breadcrumbs**, and URL resolution. Public endpoints: `GET /projects/:projectId/sitemap.xml`, `sitemap.json`, `navigation`, `urls`, `breadcrumb`. See [REST API](docs/REST%20API.md) and [Developer API](docs/Developer%20API.md).

### Navigations

Named, ordered menus (e.g. Header, Footer). Each has a **handle** (e.g. `header`) used in the public API. Items can link to pages (resolved at read time), custom URLs, assets, or act as dropdown parents. Public: `GET /projects/:projectId/navigations` and `GET /projects/:projectId/navigations/:handle`.

### Webhooks

Outbound HTTPS notifications when content events occur (entry published, asset deleted, form submitted, etc.). Signed payloads (HMAC-SHA256), configurable events and filters, retries, delivery log in Studio. See [REST API](docs/REST%20API.md) and [Developer API](docs/Developer%20API.md).

### Layouts & Blocks

- **Layouts** are ordered lists of **blocks** (e.g. hero, sections, footer).
- **Blocks** are content units with a type and data (e.g. `core/hero`, `core/text`). Block *schemas* are registered globally; *instances* live in layouts.

### Fields

Atomic data types in models, structures, blocks, and templates: `core/text`, `core/rich-text`, `core/image`, `core/select`, etc. Custom field types can be registered.

### Users & access

Users have credentials and roles (e.g. admin). Access is project-based. The API uses **JWT** for admin and **project API key** for read-only collection access.

---

## Using Moteur

### REST API (HTTP)

- **Public (read-only)** — Use your **project API key** (header `x-api-key` or query `apiKey`) to read collections, pages, navigations, sitemaps. See [Public API and Collections](docs/Public%20API%20and%20Collections.md).
- **Admin** — Use **JWT** (Bearer token) for full CRUD: projects, models, entries, templates, blueprints, webhooks, etc. See [REST API](docs/REST%20API.md).

When the server is running:

- **Swagger UI** — `GET /docs` (interactive API docs).
- **OpenAPI spec** — `GET {basePath}/openapi.json` (e.g. `http://localhost:3000/openapi.json`).

### Developer API (TypeScript)

Programmatic access from Node/TS: `import { Moteur } from '@moteur/core'`. Same capabilities as the REST API (projects, collections, entries, pages, navigations, webhooks, etc.). See [Developer API](docs/Developer%20API.md).

### CLI

Manage projects, models, entries, layouts, structures, templates, and pages from the terminal. See [CLI](docs/CLI.md).

```bash
pnpm run cli
```

### Moteur Studio

The **moteur-admin** app gives you a full admin UI: projects, models, structures, templates, pages, layouts, blocks, entries, blueprints. Use it for content editing and schema setup; use the API or CLI for automation and integration.

---

## Documentation & ecosystem

| Resource | Description |
|----------|-------------|
| [**Documentation index**](docs/README.md) | Overview of all docs and where to start. |
| [**Public API & Collections**](docs/Public%20API%20and%20Collections.md) | Quick guide: API key, collections, and consuming content. |
| [**REST API**](docs/REST%20API.md) | Full HTTP API reference (auth, projects, collections, admin). |
| [**Developer API**](docs/Developer%20API.md) | TypeScript API reference (`@moteur/core`). |
| [**OpenAPI (Swagger)**](docs/REST%20API.md#-openapi) | When the API is running: **Swagger UI** at `/docs`, **OpenAPI JSON** at `{basePath}/openapi.json`. Hosted docs: [docs.api.moteur.io](https://docs.api.moteur.io). |
| [**Moteur Studio**](../moteur-admin/README.md) | Admin UI repo and setup. Storybook: [docs.studio.moteur.io](https://docs.studio.moteur.io/). |
| [**Starters**](docs/Starters.md) | Official starters (Next.js, Astro, Eleventy, etc.) — same demo project, same patterns. |
| [**Configuration**](docs/Configuration.md) | Environment variables for the API. |
| [**CLI**](docs/CLI.md) | CLI reference. |
| [**Blueprints**](docs/Blueprints.md) | Blueprint kinds and usage. |
| [**Workflows**](docs/Workflows.md) | Entry workflow (draft, review, published). |
| [**Presence API**](docs/Presence%20API.md) | Real-time presence (e.g. editor cursors). |
| [**Authentication**](docs/Authentication.md) | JWT and project API key: how to get and use them. |
| [**Webhooks**](docs/Webhooks.md) | Outbound webhooks: events, payload, signature verification. |
| [**Fields**](docs/Fields.md) | Core field types reference. |
| [**Blocks**](docs/Blocks.md) | Core block types reference. |
| [**Seeds**](docs/Seeds.md) | Canonical blueprints and how to run seed. |

---

## Reference

### Typical workflow

1. **Configuration** — Set up field types, block definitions, and (optionally) seed blueprints.
2. **Schema** — Create models, structures, and page templates (from scratch or blueprints).
3. **Content** — Create entries, pages, and layouts (in Studio or via API/CLI).
4. **Consume** — Use the Public API (collections, pages, navigations) in your frontend or SSG.

### Seeds

Canonical blueprint seed files live under `data/seeds/blueprints/` (e.g. `project/`, `model/`, `structure/`, `template/`). Run **`pnpm run seed`** to copy missing seeds into `data/blueprints/`; use **`pnpm run seed:force`** to overwrite. See [Seeds](docs/Seeds.md) and `data/seeds/README.md` for details.

### Fields and blocks

Core field types (e.g. `core/text`, `core/rich-text`, `core/image`) and block types (e.g. `core/hero`, `core/text`) are listed in [Fields](docs/Fields.md) and [Blocks](docs/Blocks.md). Custom fields and blocks can be registered via the API or modules.

---

## Features (summary)

Flat-file JSON storage, framework-agnostic renderers, custom blocks and fields, full multilingual support, blueprints and seeds, **Moteur Studio** admin UI, REST API (JWT + project API key), **API Collections** for headless/SSG, request logging and rate limiting, webhooks, CLI, no database required, extensible (fields, blocks, validators, renderers).
