# Swagger docs (static)

This folder serves a static OpenAPI spec (`openapi.json`) for viewing in Swagger UI.

- **Live API**: When the Moteur API is running, the full spec (including activity log, comments, reviews, notifications, etc.) is available at `GET {basePath}/openapi.json` and in the **Swagger UI** at `/docs`.
- **This file**: `openapi.json` here is a snapshot. If you added new API features and they don’t appear, refresh the snapshot:
  - From production: `pnpm run fetch:openapi` (uses `https://api.moteur.io/openapi.json`).
  - From a local API (e.g. `http://localhost:3000`):  
    `curl http://localhost:3000/openapi.json -o openapi.json`
