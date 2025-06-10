## 📦 Public API (Headless Content Access)

These endpoints are safe for frontend apps, static site generators, or external consumers. All read-only.

---

### 📁 Layout Access

| Method | Endpoint                                        | Description                                               |
|--------|-------------------------------------------------|-----------------------------------------------------------|
| GET    | `./:project/layouts`                  | List all available layouts (IDs and labels).              |
| GET    | `./:project/layouts/:id`              | Get a layout's content, filtered by locale/context.       |
| GET    | `./:project/layouts/:id/render`       | Render a layout to HTML/React/Vue/etc.                    |

---

### 📁 Structure Access

| Method | Endpoint                                        | Description                                               |
|--------|-------------------------------------------------|-----------------------------------------------------------|
| GET    | `./:project/structures`               | List all available structures (IDs and labels).           |
| GET    | `./:project/structures/:id`           | Get a structure's content, filtered by locale/context.    |

---

### 📁 Model Entry Access

| Method | Endpoint                                                               | Description                                  |
|--------|------------------------------------------------------------------------|----------------------------------------------|
| GET    | `./:project/models/:model/entries`                           | List published entries for a specific model. |
| GET    | `./:project/models/:model/entries/:id`                       | Get a specific entry's content.              |

---

### 📦 Block & Field Definitions

| Method | Endpoint                      | Description                                 |
|--------|-------------------------------|---------------------------------------------|
| GET    | `./blocks`          | List available block types and their fields.|
| GET    | `./fields`          | List available field types and metadata.    |

---

### 🧪 Preview Tool

| Method | Endpoint              | Description                                           |
|--------|-----------------------|-------------------------------------------------------|
| POST   | `./preview` | Submit a layout (with context) to get rendered output.|

---

## 🔐 Admin API (Authenticated Only)

Restricted endpoints for creating, updating, and managing content and schemas.

---


## 📁 Project Management

| Method | Endpoint                            | Description                                  |
|--------|-------------------------------------|----------------------------------------------|
| GET    | `./admin/projects`        | List all projects                            |
| GET    | `./admin/projects/:id`    | Get a single project's metadata              |
| POST   | `./admin/projects`        | Create a new project                         |
| PATCH  | `./admin/projects/:id`    | Update a project's metadata                  |
| DELETE | `./admin/projects/:id`    | Delete a project and all its content         |

---

### 📁 Layout Management

| Method | Endpoint                                             | Description                                  |
|--------|------------------------------------------------------|----------------------------------------------|
| GET    | `./admin/projects/:project/layouts`        | List all layouts (including drafts).         |
| GET    | `./admin/projects/:project/layouts/:id`    | Get full layout definition.                  |
| POST   | `./admin/projects/:project/layouts`        | Create a new layout.                         |
| PUT    | `./admin/projects/:project/layouts/:id`    | Replace a layout entirely.                   |
| PATCH  | `./admin/projects/:project/layouts/:id`    | Update part of a layout.                     |
| DELETE | `./admin/projects/:project/layouts/:id`    | Delete a layout.                             |

---

### 📁 Structure Management

| Method | Endpoint                                                | Description                                  |
|--------|---------------------------------------------------------|----------------------------------------------|
| GET    | `./admin/projects/:project/structures`        | List all layouts (including drafts).         |
| GET    | `./admin/projects/:project/structures/:id`    | Get full layout definition.                  |
| POST   | `./admin/projects/:project/structures`        | Create a new layout.                         |
| PUT    | `./admin/projects/:project/structures/:id`    | Replace a layout entirely.                   |
| PATCH  | `./admin/projects/:project/structures/:id`    | Update part of a layout.                     |
| DELETE | `./admin/projects/:project/structures/:id`    | Delete a layout.                             |

---

### 🗃️ Model Schema Management

| Method | Endpoint                                                | Description                                  |
|--------|---------------------------------------------------------|----------------------------------------------|
| GET    | `./admin/projects/:project/models`            | List all model schemas.                      |
| GET    | `./admin/projects/:project/models/:id`        | Get a specific model schema.                 |
| POST   | `./admin/projects/:project/models`            | Create a new model schema.                   |
| PUT    | `./admin/projects/:project/models/:id`        | Replace a model schema entirely.             |
| PATCH  | `./admin/projects/:project/models/:id`        | Update part of a model schema.               |
| DELETE | `./admin/projects/:project/models/:id`        | Delete a model schema.                       |

---

### 📁 Entry Management

| Method | Endpoint                                                               | Description                                  |
|--------|------------------------------------------------------------------------|----------------------------------------------|
| GET    | `./admin/projects/:project/models/:model/entries`            | List all entries for a specific model.       |
| GET    | `./admin/projects/:project/models/:model/entries/:id`        | Get a specific entry's data.                 |
| POST   | `./admin/projects/:project/models/:model/entries`            | Create a new entry for a model.              |
| PUT    | `./admin/projects/:project/models/:model/entries/:id`        | Replace an entry entirely.                   |
| PATCH  | `./admin/projects/:project/models/:model/entries/:id`        | Update part of an entry.                     |
| DELETE | `./admin/projects/:project/models/:model/entries/:id`        | Delete an entry.                             |


### 🧱 Block Type Management

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `./admin/blocks`        | List all block types.                |
| GET    | `./admin/blocks/:id`    | Get a specific block schema.         |
| POST   | `./admin/blocks`        | Create a new block type.             |
| PUT    | `./admin/blocks/:id`    | Replace a block type schema.         |
| PATCH  | `./admin/blocks/:id`    | Partially update a block type.       |
| DELETE | `./admin/blocks/:id`    | Delete a block type.                 |

---

### 🧩 Field Type Management

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| GET    | `./admin/fields`        | List all field types.                |
| GET    | `./admin/fields/:id`    | Get a specific field schema.         |
| POST   | `./admin/fields`        | Create a new field type.             |
| PUT    | `./admin/fields/:id`    | Replace a field type schema.         |
| PATCH  | `./admin/fields/:id`    | Partially update a field type.       |
| DELETE | `./admin/fields/:id`    | Delete a field type.                 |

---

### 🛠 Utilities

| Method | Endpoint                            | Description                                        |
|--------|-------------------------------------|----------------------------------------------------|
| POST   | `./admin/validate`        | Validate a layout against the current schema.      |
| POST   | `./admin/render-preview`  | Render a layout with context for preview/editor.   |
| GET    | `./admin/usage`           | Show where blocks/fields are used in layouts.      |