# Project Blueprints

Blueprints are **reusable project templates** used when creating a new project. Each blueprint has an id, name, description, and an optional **template** that can define initial models, layouts, and structures. When you create a project and pass a `blueprintId`, the backend creates the project and then applies that blueprint’s template (creating those models, layouts, and structures in the new project).

## Where blueprints live (backend)

- **Storage:** Blueprints are stored as JSON files under the **blueprints directory**.
- **Default path:** `data/blueprints/` (relative to the data root — same as `DATA_ROOT` or the resolved Moteur data directory).
- **Override:** Set `BLUEPRINTS_DIR` to use another path (relative to the data root).
- **One file per blueprint:** Each blueprint is a single file: `data/blueprints/<id>.json`. The `id` must be filesystem-safe (alphanumeric, hyphens, underscores; same rules as project ids).

So from the backend’s point of view, blueprints are **file-based** in `data/blueprints/`, and the API reads/writes those files.

## Blueprint JSON shape

Each file `data/blueprints/<id>.json` should look like:

```json
{
  "id": "blog",
  "name": "Blog Site",
  "description": "Your regular personal blog with posts, listing, and comments.",
  "template": {
    "models": [ ],
    "layouts": [ ],
    "structures": [ ]
  }
}
```

- **id** (required): Unique id; must match the filename (without `.json`).
- **name** (required): Display name (e.g. in the project creation wizard).
- **description** (optional): Short explanation of the blueprint.
- **template** (optional): Object that can contain:
  - **models**: Array of model schema objects to create in the new project.
  - **layouts**: Array of layout objects to create.
  - **structures**: Array of structure schema objects to create.

If `template` is missing or has empty arrays, the blueprint only provides metadata (e.g. “Empty Project”); the project is created with no extra models, layouts, or structures.

## How “create from blueprint” works

1. **Create project:** The client calls `POST /projects` with the usual project payload (`id`, `label`, `defaultLocale`, etc.) and an optional **blueprintId**.
2. **Project creation:** The backend creates the project as usual (project record, storage, etc.).
3. **Apply template:** If `blueprintId` is present and valid, the backend loads the blueprint from `data/blueprints/<blueprintId>.json` and, if it has a `template`:
   - Creates each **model** in the new project (same as admin “create model”).
   - Creates each **layout** in the new project.
   - Creates each **structure** in the new project.
4. **Response:** The API returns the created project. Any template application errors are logged; the project is still considered created.

So “where they are” from the backend is: **files in `data/blueprints/`**, and “how it works” is: **optional template on top of normal project creation**, applied right after the project is created.

## API endpoints (admin)

Blueprints are **global**; no project ID is required. All under the same auth as other admin endpoints (e.g. bearer token).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/blueprints`       | List all blueprints (from `data/blueprints/`). |
| GET    | `/blueprints/:id`   | Get one blueprint by id. |
| POST   | `/blueprints`       | Create or replace a blueprint (body = full blueprint JSON). |
| PATCH  | `/blueprints/:id`   | Update a blueprint (partial). |
| DELETE | `/blueprints/:id`   | Delete a blueprint (removes the file). |

Creating a project from a blueprint uses the existing **Create project** endpoint (`POST /projects`) with an optional **blueprintId** in the body (see [REST API](REST%20API.md)).

## Project creation form (admin UI)

In the project creation wizard:

1. **Blueprint step:** The user selects a blueprint (or “Empty”). The list is loaded from `GET /blueprints`.
2. **Later steps:** The user enters project id, label, etc.
3. **Submit:** The client calls `POST /projects` with project data and the selected **blueprintId** (or omits it for no template). The backend creates the project and, when **blueprintId** is set, applies the blueprint’s template from `data/blueprints/`.

Blueprint management in the admin UI is under the global **Blueprints** area (e.g. `/blueprints`), not under a project.
