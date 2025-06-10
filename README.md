# Moteur

**Moteur** is a framework-agnostic content block system for structured, multilingual content.  
It uses flat JSON files for storage, supports modular data definitions, and has a pluggable rendering system for HTML, CLI, or APIs.

---

## 🚀 Features

- Flat-file JSON storage for portability and simplicity  
- Framework-agnostic renderers (HTML, CLI, API)  
- Custom & nested block support for flexible content structures  
- Full multilingual support for all fields  
- Conditional rendering by locale, user roles, or custom logic  
- Modules system for bundling field, block, and structure definitions  
- Plugins system for dynamic logic (validators, renderers, APIs)  
- Field-level validators (fully pluggable, project-specific or module-based)  
- Interactive CLI for managing projects, entries, layouts, and structures  
- Secure API endpoints with JWT authentication and role-based access control  
- Project-based scoping to isolate content and configurations  
- Dynamic asset handling (e.g., image resizing) via optional plugins  
- Developer-friendly JSON schemas for data definitions  
- Easy-to-integrate with static site generators or custom headless frontends  
- No database dependencies – works anywhere Node.js runs  
- Extensible by design: add your own fields, blocks, validators, and renderers without modifying the core  

---

## 🛠️ Typical Workflow

1. **Configuration**  
   Administrators set up which core field types and block definitions are available in Moteur.

2. **Schema Definition**  
   Site administrators create new block schemas (and optionally new field types) to match content needs.

3. **Content Creation**  
   Content editors assemble sections by adding blocks, selecting block types, and filling in fields as defined by the schemas.

4. **Rendering**  
   The system renders sections and blocks using the chosen framework or adapter, supporting multilingual and conditional logic as needed.

---

# 🗝️ Moteur: Core Concepts

## 🔹 Projects
The top-level unit for your content and configuration. Everything in Moteur is scoped to a project.

- Defines:
  - Project details (id, label, locale)
  - Which **Modules** and **Plugins** to use
  - **Users** and **Teams** with access

---

## 🔹 Layouts & Blocks
**Layouts** define how pages and entries are structured visually.

- **Layouts**: reusable page structures (header, footer, main content areas). A collection of blocks.
- **Blocks**: reusable components (content units) inside layouts.

Blocks are defined by a `Block Schema` (a collection of fields). Instances of blocks are simply blocks inside layouts.  
Layouts are typically used inside a Page, an Entry, or as reusable components anywhere.

---

## 🔹 Models & Entries
**Models** define the schema for a structured content object (like “Product” or “Article”).

- Example: fields like `title`, `price`, `description`.

**Entries** are **instances** of models, holding real data.

- Example: an actual “Red T-shirt” product entry.

---

## 🔹 Templates & Pages
**Templates** (also called **Page Templates**) define how **Pages** are built.

- **Templates**: reusable page schemas (like “Blog Post Template”).
- **Pages**: actual top-level content created from a template (like “Home”, “About”).

---

## 🔹 Users & Teams
**Users**: people with login credentials and access rights.

**Teams** (future): groups of users sharing access to projects.

---

## 🔹 Fields & Structures
**Fields**: atomic data types (text, number, boolean, etc.).

**Structures**: reusable **bundles of fields** (like a “Team Member” group).

---

## 🔹 Modules & Plugins
**Modules**: bundles of data definitions (fields, blocks, structures, models, templates).

- Examples:
  - Core modules (`core`)
  - Custom modules (`custom1`, `marketing`)

**Plugins**: executable logic (validators, renderers, dynamic endpoints).  
Plugins can also provide their own modules.

---

## 🚀 Summary
✅ Everything is **scoped to a project**  
✅ **Layouts** and **Blocks** shape the visual structure  
✅ **Models** and **Templates** define structured content types  
✅ **Entries** and **Pages** are the actual data/content  
✅ **Fields** and **Structures** are the building blocks  
✅ **Users** and (future) **Teams** control access  
✅ **Modules** hold data definitions and **Plugins** add dynamic logic  

---

## 🛠️ Available fields (core)

| Name               | Description                          | Usage                                      | Fields / Value                     | Options / Meta            |
|--------------------|--------------------------------------|--------------------------------------------|------------------------------------|---------------------------|
| **core/boolean**    | True/false toggle                    | Toggles, flags, visibility                 | `value`: boolean                   | `default`                 |
| **core/color**      | Color picker or color string         | Backgrounds, highlights, accent colors     | `value`: hex/rgb string            | `default`                 |
| **core/image**      | Image with optional alt text         | Thumbnails, hero images, icons             | `src`, `alt`: multilingual         | —                         |
| **core/link**       | Accessible hyperlink                 | Buttons, CTAs, external/internal links     | `url`, `label`, `ariaLabel`        | `target`, `rel`, `meta`  |
| **core/list**       | Repeated items (values or objects)   | Bullet points, tags, grouped inputs        | `items`: field definition          | `minItems`, `maxItems`    |
| **core/markdown**   | Markdown content (renders to HTML)   | Content blocks, notes, formatted text      | `content`: multilingual Markdown   | —                         |
| **core/number**     | Numeric input                        | Ordering, scores, prices, metrics          | `value`: number                    | `min`, `max`, `step`      |
| **core/object**     | Group of custom subfields            | Nested input groups, form-style data       | `fields`: inline definition        | `showLabel`, `display`    |
| **core/rich-text**  | Rich HTML-formatted content          | Summaries, bios, content blocks            | `content`: multilingual HTML       | —                         |
| **core/select**     | Select from predefined options       | Layout choice, alignment, tag level        | `value`: string                    | `options[]`, `default`    |
| **core/structure**  | Reusable schema-based object         | Team members, addresses, prices, etc.      | `schema`: ID or inline, `value`    | Custom renderer (optional)|
| **core/text**       | Simple text string                   | Titles, labels, captions, metadata         | `text`: string (multilingual)      | —                         |
| **core/url**        | Simple URL string                    | Video embed links, social links            | `url`: string                      | —                         |
| **core/video**      | Embedded video player                | YouTube, Vimeo, self-hosted videos         | `url`, `alt`, `provider` (optional)| `autoplay`, `loop`, `muted` |

---

## 🛠️ Available blocks (core)

| Name               | Description                         | Usage / Purpose                               | Key Fields                          |
|--------------------|-------------------------------------|-----------------------------------------------|-------------------------------------|
| **core/accordion** | Expandable list of sections         | FAQs, multi-step guides, collapsible content  | `items`: list of `title`, `content` |
| **core/container** | Container for nested blocks         | Layout control, columns, grouped content      | `blocks[]`, `style`, `alignment`    |
| **core/gallery**   | Image grid or carousel              | Showcases, product images, event photos       | `images[]`, `layout`, `columns`     |
| **core/hero**      | Large banner with title/cta         | Page header, promo block                      | `title`, `subtitle`, `image`, `cta` |
| **core/image**     | Full-width or decorative image      | Separators, illustrations, standalone images  | `src`, `alt`, `caption`             |
| **core/quote**     | Highlighted quotation with author   | Testimonials, literary quotes, pull quotes    | `text`, `author`, `authorImage`     |
| **core/spacer**    | Adds vertical space between blocks  | Layout separation or rhythm                   | `size`, `unit`                      |
| **core/text**      | Simple paragraph block              | Content sections, intros, descriptions        | `content`: rich text                |
| **core/video**     | Embedded video block                | YouTube, Vimeo, self-hosted embeds            | `url`, `autoplay`, `caption`        |

> Custom blocks can be easily added with the admin API above.

---

## 💻 How to use

**With the CLI:**

```bash
npm run cli
```

**With the REST API:**

```bash
GET http://localhost:3000/moteur/projects/:projectId/models/:model/entries
```