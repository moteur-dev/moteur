# Moteur documentation

This folder contains the main documentation for **developers using Moteur**: concepts, APIs, configuration, and tooling. The focus is on integrating with the content API, managing content via the admin API or Studio, and connecting your frontend or SSG.

---

## Where to start

| Goal | Read this |
|------|-----------|
| **Consume content in a frontend or SSG** | [Public API and Collections](Public%20API%20and%20Collections.md) → then use the REST endpoints or [Developer API](Developer%20API.md). |
| **Full HTTP API reference** | [REST API](REST%20API.md) — auth, projects, collections, admin CRUD, webhooks. |
| **Use Moteur from Node/TypeScript** | [Developer API](Developer%20API.md) — `@moteur/core` programmatic API. |
| **Run and configure the API** | [Configuration](Configuration.md) — environment variables. |
| **Manage content from the terminal** | [CLI](CLI.md). |
| **Pick a frontend stack** | [Starters](Starters.md) — Next.js, Astro, Eleventy, etc. |

---

## Documentation index

| Document | Description |
|----------|-------------|
| [**Public API and Collections**](Public%20API%20and%20Collections.md) | Quick guide: get a project API key, create a collection, and read entries/pages from your frontend. |
| [**REST API**](REST%20API.md) | Full HTTP API: auth, projects, models, entries, collections, pages, navigations, admin, webhooks. OpenAPI/Swagger details included. |
| [**Developer API**](Developer%20API.md) | TypeScript API reference for `@moteur/core`: projects, collections, entries, pages, navigations, webhooks, etc. |
| [**Configuration**](Configuration.md) | Environment variables for the Moteur API (base path, CORS, rate limits, auth, storage). |
| [**CLI**](CLI.md) | CLI reference: projects, models, entries, layouts, structures, templates, pages, blueprints. |
| [**Starters**](Starters.md) | Official starters (Next.js, Astro, Eleventy, etc.) — same demo project, same content patterns. |
| [**Blueprints**](Blueprints.md) | Blueprint kinds (project, model, structure, template) and how to use them. |
| [**Workflows**](Workflows.md) | Entry workflow: draft, in_review, published. |
| [**Presence API**](Presence%20API.md) | Real-time presence (e.g. editor cursors, form state). |

---

## Ecosystem & external resources

| Resource | Description |
|----------|-------------|
| **OpenAPI (Swagger)** | When the Moteur API is running: **Swagger UI** at `GET /docs`, **OpenAPI 3 spec** at `GET {basePath}/openapi.json` (e.g. `http://localhost:3000/openapi.json`). Hosted API docs: [docs.api.moteur.io](https://docs.api.moteur.io). |
| **Moteur Studio** | Admin UI for content and schema. Repo: `moteur-admin`. Storybook: [docs.studio.moteur.io](https://docs.studio.moteur.io/). |
| **Starters** | Clone-and-run repos for Next.js, Astro, Eleventy, and more. See [Starters](Starters.md) for links and comparison. |

---

## Core concepts (summary)

- **Projects** — Top-level scope; all content and config live inside a project.
- **Collections** — Named views of project data for your app; access with the project **API key** (read-only).
- **Models & entries** — Content types (models) and their data (entries); workflow: draft → in_review → published.
- **Templates & pages** — Page templates define schema; pages form a tree (static pages, collection pages, folders).
- **Navigations** — Menus (e.g. header, footer) with handles for the public API.
- **Blueprints** — Reusable templates for projects, models, structures, and page templates; use **seeds** to install defaults.

For a longer overview, see the main [Moteur README](../README.md).
