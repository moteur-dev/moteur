# Moteur

**Moteur** is a framework-agnostic content block system for structured, multilingual content.  
It uses flat JSON files for storage, supports modular data definitions, and has a pluggable rendering system for HTML, CLI, or APIs.

---

## Features

- Flat-file JSON storage for portability and simplicity  
- Framework-agnostic renderers (HTML, CLI, API)  
- Custom & nested block support for flexible content structures  
- Full multilingual support for all fields  
- Conditional rendering by locale, user roles, or custom logic  
- **Blueprints**: reusable templates for projects, models, structures, and page templates  
- **Seeds**: one-command setup to populate blueprints from canonical seed files  
- **Moteur Studio** (admin UI): list pages and create wizards for all core objects  
- Modules system for bundling field, block, and structure definitions  
- Plugins system for dynamic logic (validators, renderers, APIs)  
- Field-level validators (fully pluggable, project-specific or module-based)  
- Interactive CLI for managing projects, models, entries, layouts, structures, templates, and pages  
- REST API with JWT auth and role-based access; admin endpoints for full CRUD  
- **API Collections**: named, configured views of project data for headless/SSG consumers; one project API key per project, read-only key auth  
- **Request logging & rate limiting**: admin and public requests counted separately for audit and billing; optional audit log file; configurable rate limits (see [REST API](docs/REST%20API.md) and [Configuration](docs/Configuration.md))  
- Project-based scoping to isolate content and configurations  
- No database dependencies ? works anywhere Node.js runs  
- Extensible by design: add your own fields, blocks, validators, and renderers without modifying the core  

---

## Quick start

1. **Install and build** (from the `moteur` directory):
   ```bash
   pnpm install && pnpm run build
   ```

2. **Seed blueprints** (optional ? copies seed files into `data/blueprints/` when missing):
   ```bash
   pnpm run seed
   # Or overwrite existing: pnpm run seed:force
   ```

3. **Run the API**:
   ```bash
   pnpm run server:dev
   ```

4. **Run the Studio** (from `moteur-admin`): create and manage projects, models, templates, structures, layouts, blocks, pages, and entries from the UI.
   ```bash
   cd ../moteur-admin && pnpm install && pnpm run dev
   ```

---

## Core concepts

### Projects
The top-level unit. Everything in Moteur is scoped to a **project**: models, entries, layouts, structures, templates, and pages live inside a project. Projects can be created from a **project blueprint** (optional) to apply initial models, layouts, and structures.

### Collections (API)
A **Collection** is a named, configured view of project data for external consumers (frontends, mobile apps, static site generators). Each project has one **API key**. Collections define which models and pages that key can see, with optional field selection, status filters, and reference resolution depth. Key auth is read-only (GET only). See [Public API and Collections](docs/Public%20API%20and%20Collections.md) for a short setup guide, [REST API](docs/REST%20API.md) for endpoints, and [Developer API](docs/Developer%20API.md) for programmatic access.

### Blueprints
Reusable templates with a **kind**. Stored under `data/blueprints/<kind>/`.

| Kind | Purpose |
|------|---------|
| **project** | Apply initial models, layouts, structures when creating a new project. |
| **model** | Create a model in a project from a predefined schema (e.g. Blog Post, Basic Page). |
| **structure** | Create a project structure from a predefined schema (e.g. Publishable, SEO). |
| **template** | Create a page template in a project from a predefined schema (e.g. Landing, Article). |

Create and edit blueprints via the **Blueprints** section in the Studio or the REST API. When creating a model, structure, or template, you can pass `blueprintId` to instantiate from a blueprint and optionally override fields.

### Models & Entries
- **Models** define the schema for a content type (e.g. Product, Article): id, label, description, and a set of **fields**.
- **Entries** are instances of a model, holding the actual data. They support workflow status (draft, in_review, published) and validation.

### Structures
**Structures** are reusable bundles of fields (e.g. Publishable, SEO, Team Member). They have a `type` (e.g. `project/seo`), label, and `fields`. Project-scoped structures live in the project storage; core structures are read-only. Use structure blueprints to add common structures quickly.

### Templates & Pages
- **Templates** (page templates) define the schema for a page: id, label, description, and **fields**. They are project-scoped.
- **Pages** are organized as a **typed page tree**:
  - **Static pages**: authored content, one URL each; created from a template (templateId, label, slug, parent, status, fields).
  - **Collection pages**: bound to a **model**; they have an index URL and generate one URL per published entry using a **URL pattern** (e.g. `[post.slug]`). Use **template blueprints** for the index template and set the model’s **urlPattern** (or override on the node).
  - **Folder nodes**: structural grouping only (label, slug, parent); no content, no URL.
- The tree drives **sitemap** generation, **navigation** output, **breadcrumbs**, and URL resolution. Public endpoints: `GET /projects/:projectId/sitemap.xml`, `sitemap.json`, `navigation`, `urls`, `breadcrumb`. See [REST API](docs/REST%20API.md) and [Developer API](docs/Developer%20API.md).

### Navigations
**Navigations** are independent of the page tree: named, ordered, nested menus (e.g. Header, Footer, Mobile). Each navigation has a **handle** (URL-safe, unique per project) used to fetch it in the public API. **Items** can link to:
- **Pages** (by `pageId`): URL is resolved at read time from the page tree.
- **Custom URLs**: any valid URL (`/path`, `https://...`, `mailto:`, `tel:`, `#anchor`).
- **Assets** (by `assetId`): URL is resolved from the asset’s stored URL.
- **None**: the item acts as a dropdown parent with no destination.

Items support **custom fields** via the navigation’s **itemSchema** (same field type system as models). Resolution never throws: missing page or asset references yield `url: undefined`. Public: `GET /projects/:projectId/navigations` (all resolved) and `GET /projects/:projectId/navigations/:handle`. See [REST API](docs/REST%20API.md) and [Developer API](docs/Developer%20API.md).

### Layouts & Blocks
- **Layouts** are ordered lists of **blocks** (with optional metadata). They define how content is composed (e.g. hero, sections, footer).
- **Blocks** are content units with a type and data. Block *schemas* are registered globally (e.g. core/hero, core/text); block *instances* live inside layouts. Layouts are project-scoped and can be created from the Studio or API.

### Fields
Atomic data types used inside models, structures, blocks, and templates: e.g. `core/text`, `core/rich-text`, `core/image`, `core/select`. Custom field types can be registered via the field registry.

### Users & access
**Users** have credentials and roles (e.g. admin). Access is project-based. The API uses JWT and project-scoped middlewares (`requireAdmin`, `requireProjectAccess`).

### Modules & Plugins
- **Modules**: bundles of definitions (fields, blocks, structures). Core provides the default set.
- **Plugins**: executable logic (validators, renderers, activity log, etc.) that can hook into events and expose APIs.

---

## Seeds

Canonical blueprint seed files live under `data/seeds/blueprints/`:

- `project/` ? e.g. empty, blog
- `model/` ? e.g. blog-post, basic-page
- `structure/` ? e.g. publishable, seo
- `template/` ? e.g. landing, article, default

Run **`pnpm run seed`** to copy missing seeds into `data/blueprints/`. Use **`pnpm run seed:force`** to overwrite existing blueprint files. See `data/seeds/README.md` for details.

---

## Moteur Studio (admin UI)

The **moteur-admin** app (Moteur Studio) provides:

- **Projects**: list, create (with optional project blueprint), project details
- **Models**: list, create (Model Wizard with model blueprints), model editor
- **Structures**: list, create (Structure Wizard with structure blueprints), structure editor
- **Templates**: list, create (Template Wizard with template blueprints), template editor
- **Pages**: list, create (Page Wizard), page editor
- **Layouts**: list, create (Layout Wizard), layout editor (placeholder)
- **Blocks**: list, create (Block Wizard)
- **Entries**: list per model, create (Entry Wizard), entry editor
- **Blueprints**: list by kind (Projects, Models, Structures, Templates), create/edit via JSON

List pages support search, sort, and list/card view where applicable. Wizards that support blueprints load options from the API and send `blueprintId` when creating from a blueprint.

---

## Typical workflow

1. **Configuration** ? Set up field types, block definitions, and (optionally) seed blueprints.
2. **Schema definition** ? Create models, structures, and page templates (from scratch or from blueprints).
3. **Content creation** ? Create entries (from models), pages (from templates), and layouts (from blocks).
4. **Rendering** ? Use the HTML renderer, API, or your own adapter to output content.

---

## Available fields (core)

| Name               | Description                          | Usage                                      | Fields / Value                     | Options / Meta            |
|--------------------|--------------------------------------|--------------------------------------------|------------------------------------|---------------------------|
| **core/boolean**   | True/false toggle                    | Toggles, flags, visibility                 | `value`: boolean                   | `default`                 |
| **core/color**     | Color picker or color string         | Backgrounds, highlights, accent colors     | `value`: hex/rgb string            | `default`                 |
| **core/image**     | Image with optional alt text         | Thumbnails, hero images, icons             | `src`, `alt`: multilingual        | ?                         |
| **core/link**      | Accessible hyperlink                 | Buttons, CTAs, external/internal links     | `url`, `label`, `ariaLabel`        | `target`, `rel`, `meta`   |
| **core/list**      | Repeated items (values or objects)   | Bullet points, tags, grouped inputs        | `items`: field definition          | `minItems`, `maxItems`    |
| **core/markdown**  | Markdown content (renders to HTML)  | Content blocks, notes, formatted text      | `content`: multilingual Markdown  | ?                         |
| **core/number**    | Numeric input                        | Ordering, scores, prices, metrics          | `value`: number                    | `min`, `max`, `step`      |
| **core/object**    | Group of custom subfields            | Nested input groups, form-style data       | `fields`: inline definition        | `showLabel`, `display`     |
| **core/rich-text** | Rich HTML-formatted content          | Summaries, bios, content blocks            | `content`: multilingual HTML       | ?                         |
| **core/select**    | Select from predefined options       | Layout choice, alignment, tag level        | `value`: string                    | `options[]`, `default`    |
| **core/structure** | Reusable schema-based object         | Team members, addresses, prices, etc.       | `schema`: ID or inline, `value`    | Custom renderer (optional)|
| **core/text**      | Simple text string                   | Titles, labels, captions, metadata         | `text`: string (multilingual)      | ?                         |
| **core/url**       | Simple URL string                    | Video embed links, social links            | `url`: string                      | ?                         |
| **core/video**     | Embedded video player                | YouTube, Vimeo, self-hosted videos         | `url`, `alt`, `provider` (optional)| `autoplay`, `loop`, `muted` |

---

## Available blocks (core)

| Name               | Description                         | Usage / Purpose                               | Key Fields                          |
|--------------------|-------------------------------------|-----------------------------------------------|-------------------------------------|
| **core/accordion** | Expandable list of sections         | FAQs, multi-step guides, collapsible content  | `items`: list of `title`, `content` |
| **core/container**| Container for nested blocks         | Layout control, columns, grouped content      | `blocks[]`, `style`, `alignment`    |
| **core/gallery**   | Image grid or carousel              | Showcases, product images, event photos       | `images[]`, `layout`, `columns`     |
| **core/hero**      | Large banner with title/cta         | Page header, promo block                      | `title`, `subtitle`, `image`, `cta` |
| **core/image**     | Full-width or decorative image      | Separators, illustrations, standalone images  | `src`, `alt`, `caption`             |
| **core/quote**     | Highlighted quotation with author   | Testimonials, literary quotes, pull quotes    | `text`, `author`, `authorImage`     |
| **core/spacer**    | Adds vertical space between blocks  | Layout separation or rhythm                   | `size`, `unit`                      |
| **core/text**      | Simple paragraph block              | Content sections, intros, descriptions        | `content`: rich text                |
| **core/video**     | Embedded video block                | YouTube, Vimeo, self-hosted embeds            | `url`, `autoplay`, `caption`        |

> Custom blocks can be easily added with the admin API above.

---

## How to use

**With the CLI:**

```bash
pnpm run cli
```

**With the REST API:**

```bash
GET http://localhost:3000/projects/:projectId/models
GET http://localhost:3000/projects/:projectId/models/:modelId/entries
```

See the API docs (e.g. `/docs` when the server is running) for full endpoint reference.
