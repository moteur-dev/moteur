# Seed data

This directory contains **canonical seed blueprints** used to populate `data/blueprints/` when they are missing.

## Layout

- `blueprints/project/` – project blueprints (empty, blog, …)
- `blueprints/model/` – model blueprints (blog-post, basic-page, …)
- `blueprints/structure/` – structure blueprints (publishable, seo, …)
- `blueprints/template/` – page template blueprints (landing, article, default)

## Running seeds

From the **moteur** directory:

```bash
# Copy only missing blueprints (safe default)
pnpm run seed

# Overwrite existing blueprint files with seed versions
pnpm run seed:force
```

Or via the CLI:

```bash
pnpm run cli -- seed
pnpm run cli -- seed --force
```

Seeds are copied from `data/seeds/blueprints/<kind>/` into `data/blueprints/<kind>/`. The data root is resolved the same way as the API (e.g. `DATA_ROOT` or `moteur` when run from the workspace root).
