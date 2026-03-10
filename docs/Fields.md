# Fields reference (core)

Fields are atomic data types used in **models**, **structures**, **blocks**, and **page templates**. The core package provides the following field types. Custom field types can be registered via the field registry.

---

## Core fields

| Name | Description | Typical usage | Value / shape |
|------|-------------|---------------|----------------|
| **core/boolean** | True/false toggle | Toggles, flags, visibility | `value`: boolean |
| **core/color** | Color picker or color string | Backgrounds, highlights, accent colors | `value`: hex/rgb string |
| **core/image** | Image with optional alt text | Thumbnails, hero images, icons | `src`, `alt` (multilingual) |
| **core/link** | Accessible hyperlink | Buttons, CTAs, internal/external links | `url`, `label`, `ariaLabel`; options: `target`, `rel`, `meta` |
| **core/list** | Repeated items (values or objects) | Bullet points, tags, grouped inputs | `items`: field definition; options: `minItems`, `maxItems` |
| **core/markdown** | Markdown content (renders to HTML) | Content blocks, notes, formatted text | `content`: multilingual Markdown |
| **core/number** | Numeric input | Ordering, scores, prices, metrics | `value`: number; options: `min`, `max`, `step` |
| **core/object** | Group of custom subfields | Nested input groups, form-style data | `fields`: inline definition; options: `showLabel`, `display` |
| **core/rich-text** | Rich HTML-formatted content | Summaries, bios, content blocks | `content`: multilingual HTML |
| **core/select** | Select from predefined options | Layout choice, alignment, tag level | `value`: string; options: `options[]`, `default` |
| **core/structure** | Reusable schema-based object | Team members, addresses, prices | `schema`: ID or inline, `value`; optional custom renderer |
| **core/text** | Simple text string | Titles, labels, captions, metadata | `text`: string (multilingual) |
| **core/url** | Simple URL string | Video embed links, social links | `url`: string |
| **core/video** | Embedded video player | YouTube, Vimeo, self-hosted | `url`, `alt`, `provider` (optional); options: `autoplay`, `loop`, `muted` |

---

## Usage

Fields are referenced by **type** (e.g. `core/text`) in model and structure definitions. Options (e.g. `default`, `min`, `max`, `options`) are set per field in the schema. Multilingual fields store values per locale. See [Blueprints](Blueprints.md) and the REST/Developer API for creating models and structures.
