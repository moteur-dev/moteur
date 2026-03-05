# 🧭 Moteur CLI Reference

The Moteur CLI allows you to manage projects, layouts, structures, blocks, and fields via the terminal.

---

> To run a command, use `npm run cli command subcommand -- --flags` (Notice the extra `--`)
> Or in dev mode: `npm run cli:dev command subcommand -- --flags`

> Run without command or subcommand for a full interactive CLI

## 🔧 Global Flags

| Flag                | Description                                       |
|---------------------|---------------------------------------------------|
| `--json`            | Output results as raw JSON                        |
| `--quiet`           | Suppress all output except errors                 |
| `--file=path.json`  | Load full input from a JSON file                  |
| `--data='{...}'`    | Provide inline JSON as input                      |

> Note that setting `--json` will force quiet mode

> Note that only one of `file` or `data` is permitted. Scripts are expected to break if both are passed to a single command at the same time.
---

## 🔐 Auth

| Command                                    | Description                                                |
|--------------------------------------------|------------------------------------------------------------|
| `auth login`                               | Log in and save JWT token                                   |
| `auth logout`                              | Log out and remove JWT token                               |
| `auth create-user`                         | Create a new user (interactive; no login required)         |
| `auth list`                                | List all users and their roles/permissions (admin only)     |
| `auth list --json`                         | List users as JSON (admin only)                             |
| `auth list --quiet`                        | Suppress human-readable output                             |
| `auth list --project=site1`                | List only users with access to the given project (admin)   |

---


## 📁 Projects

| Command                                              | Description                                |
|------------------------------------------------------|--------------------------------------------|
| `projects list`                                      | List all available projects                |
| `projects get --id=site1`                            | Show details of a specific project         |
| `projects create`                                    | Create a new project (interactive)         |
| `projects create --file=myproject.json`              | Create a new project (from JSON file)      |
| `projects create --data={...}`                       | Create a new project (from inline data)    |
| `projects patch --id=site1`                          | Patch existing project (interactive)       |
| `projects patch --id=site1 --file`                   | Patch existing project (from JSON file)    |
| `projects patch --id=site1 --data={...}`             | Patch existing project (from inline data)  |
| `projects delete --id=site1`                         | Move a project to the trash                |

---

## 📄 Layouts

| Command                                                      | Description                              |
|--------------------------------------------------------------|------------------------------------------|
| `layouts list --project=site1`                               | List layouts in a project                |
| `layouts get --project=site1 --id=homepage`                  | Show the full layout content             |
| `layouts create --project=site1 [--file | --data]`           | Create a new layout                      |
| `layouts patch --project=site1 --id=homepage [--file | --data]` | Patch an existing layout              |
| `layouts delete --project=site1 --id=homepage`               | Move a layout to the trash               |

---

## 🧱 Structures

| Command                                                           | Description                                 |
|-------------------------------------------------------------------|---------------------------------------------|
| `structures list --project=site1`                                 | List available structures (global + local)  |
| `structures get --project=site1 --id=core/teamMember`             | Get a structure definition                  |
| `structures create --project=site1 [--file | --data]`             | Create a structure in a project             |
| `structures patch --project=site1 --id=core/teamMember [--file | --data]` | Patch a structure                   |
| `structures delete --project=site1 --id=core/teamMember`          | Move a structure to the trash               |

---

## 🗂️ Models

| Command                                                      | Description                                  |
|--------------------------------------------------------------|----------------------------------------------|
| `models list --project=site1`                                | List model schemas in a project              |
| `models get --project=site1 --id=article`                     | Show the full model schema                   |
| `models create --project=site1`                               | Create a new model schema (interactive)      |
| `models create --project=site1 --file=path.json`             | Create a new model schema (from JSON file)   |
| `models create --project=site1 --data={...}`                  | Create a new model schema (from inline data)|
| `models patch --project=site1 --id=article [--file \| --data]`| Patch an existing model schema               |
| `models delete --project=site1 --id=article`                  | Move a model schema to the trash             | 

---

## 📜 Entries

| Command                                                          | Description                                      |
|------------------------------------------------------------------|--------------------------------------------------|
| `entries list --project=site1 --model=article`                 | List entries of a specific model                 |
| `entries get --project=site1 --model=article --id=entry123`     | Show the full entry data                         |
| `entries create --project=site1 --model=article [--file \| --data]` | Create a new entry                          |
| `entries patch --project=site1 --model=article --id=entry123 [--file \| --data]` | Patch an existing entry              |
| `entries delete --project=site1 --model=article --id=entry123`   | Move an entry to the trash                       |
| `entries validate --project=site1 --model=article --id=entry123`   | Validate a single entry                          |
| `entries validate --project=site1 --model=article`                 | Validate all entries in a model                  |
| `entries validate --project=site1`                                | Validate all entries in all models of a project  |

---

## 💬 Comments

| Command                                                                 | Description                                              |
|-------------------------------------------------------------------------|----------------------------------------------------------|
| `comments list --project=site1 --resource-type=entry --resource-id=article__e1` | List comments for a resource (entry or layout)          |
| `comments list ... --field-path=hero.title`                             | Filter by field path (optional)                          |
| `comments list ... --include-resolved=true`                             | Include resolved comments (default: unresolved only)    |
| `comments add --project=site1 --resource-type=entry --resource-id=article__e1 --body="Your text"` | Add a comment                            |
| `comments add ... --field-path=hero.title`                              | Attach comment to a specific field (optional)            |
| `comments add ... --block-id=block-1`                                  | Attach to a layout block (optional)                       |
| `comments add ... --parent-id=<comment-id>`                             | Add a reply (one level only; optional)                   |
| `comments add ... [--file \| --data]`                                   | Provide body via JSON file or inline JSON with `body`     |
| `comments resolve --project=site1 --id=<comment-id>`                    | Mark a comment as resolved                               |
| `comments delete --project=site1 --id=<comment-id>`                     | Delete a comment (author or admin only)                   |
| `comments edit --project=site1 --id=<comment-id> --body="New text"`    | Edit comment body (author only)                           |
| `comments edit ... [--file \| --data]`                                  | Provide new body via JSON with `body`                     |

Use `--json` on list/add/resolve/edit for raw JSON output. `--project` can be omitted to pick from an interactive project list.

---

## 🧩 Fields & 📦 Blocks

Field and block type listings are available from the **interactive CLI menu** (run the CLI without a command). Top-level `fields list` and `blocks list` commands are not currently registered; use the menu or the Developer API for programmatic access.