# Blocks reference (core)

Blocks are content units that live inside **layouts**. Each block has a **type** (e.g. `core/hero`, `core/text`) and typed **data**. Block *schemas* are registered globally; *instances* are stored in layout JSON. The core package provides the following block types. Custom blocks can be registered via the API or modules.

---

## Core blocks

| Name | Description | Typical usage | Key fields |
|------|-------------|----------------|------------|
| **core/accordion** | Expandable list of sections | FAQs, multi-step guides, collapsible content | `items`: list of `title`, `content` |
| **core/container** | Container for nested blocks | Layout control, columns, grouped content | `blocks[]`, `style`, `alignment` |
| **core/gallery** | Image grid or carousel | Showcases, product images, event photos | `images[]`, `layout`, `columns` |
| **core/hero** | Large banner with title/cta | Page header, promo block | `title`, `subtitle`, `image`, `cta` |
| **core/image** | Full-width or decorative image | Separators, illustrations, standalone images | `src`, `alt`, `caption` |
| **core/quote** | Highlighted quotation with author | Testimonials, literary quotes, pull quotes | `text`, `author`, `authorImage` |
| **core/spacer** | Vertical space between blocks | Layout separation or rhythm | `size`, `unit` |
| **core/text** | Simple paragraph block | Content sections, intros, descriptions | `content`: rich text |
| **core/video** | Embedded video block | YouTube, Vimeo, self-hosted embeds | `url`, `autoplay`, `caption` |

---

## Usage

Layouts are ordered lists of block instances. Create and edit layouts via **Moteur Studio**, the REST API, or the Developer API. Block definitions (schemas) are managed via the admin API; see [REST API](REST%20API.md) and [Developer API](Developer%20API.md). For layout CRUD, the Developer API is the primary interface until REST layout endpoints are added.
