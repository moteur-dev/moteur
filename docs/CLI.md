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

> Note that only one of `file` or `data` is permitted. Scripts are expected to break if both are pased to a single command at the same time.
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
| `projects patch --id=site1 -data`                    | Patch existing project (from inline data)  |
| `projects delete --id=site1`                         | Move a project to the trash                |
| `projects validate`                                  | Validate all projects                      |
| `projects validate --id=site1`                       | Validate a single project                  | 

---

## 📄 Layouts

| Command                                                      | Description                              |
|--------------------------------------------------------------|------------------------------------------|
| `layouts list --project=site1`                               | List layouts in a project                |
| `layouts get --project=site1 --id=homepage`                  | Show the full layout content             |
| `layouts create --project=site1 [--file | --data]`           | Create a new layout                      |
| `layouts patch --project=site1 --id=homepage [--file | --data]` | Patch an existing layout              |
| `layouts delete --project=site1 --id=homepage`               | Move a layout to the trash               |
| `layouts validate --project=site1`                           | Validate all layouts of a project        |

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

| Command                                                      | Description
|--------------------------------------------------------------|----------------------------------------------|
| `models list --project=site1`                                | List model schemas in a project              | 
| `models get --project=site1 --id=article`                    | Show the full model schema                   | 
| `models create --project=site1`                              | Create a new model schema (interactive)      |
| `models create --project=site1 --file`                       | Create a new model schema (from JSON file)   |
| `models create --project=site1 --data`                       | Create a new model schema (from imline data) | 
| `models patch --project=site1 --id=article [--file --data]`  | Patch an existing model schema               | 
| `models delete --project=site1 --id=article`                 | Move a model schema to the trash             | 
| `models validate --project=site1 --id=article`               | Validate a single model schema               | 
| `models validate --project=site1`                            | Validate all model schemas in a project      | 

---

## 📜 Entries

| Command                                                          | Description                                      |
|------------------------------------------------------------------|--------------------------------------------------|
`entries list --project=site1 --model=article`                     | List entries of a specific model                 |
`entries get --project=site1 --model=article --id=entry123`        | Show the full entry data                         |
`entries create --project=site1 --model=article [--file--data]`    | Create a new entry                               |
`entries patch --project=site1 --model=article --id=entry123 [--file --data]`  | Patch an existing entry              |
`entries delete --project=site1 --model=article --id=entry123`     | Move an entry to the trash                       |
`entries validate --project=site1 --model=article --id=entry123`   | Validate a single entry                          |
`entries validate --project=site1 --model=article`                 | Validate all entries in a model                  |
`entries validate --project=site1`                                 | Validate all entries in all models of a project  |

---

## 🧩 Fields

| Command         | Description                        |
|-----------------|------------------------------------|
| `fields list`   | List all available field types     |

---

## 📦 Blocks

| Command                      | Description                                        |
|------------------------------|----------------------------------------------------|
| `blocks list [--project=site1]` | List all available block types (and overrides)  |

## ✅ Validation

| Command                                                               | Description                                                       |
|-----------------------------------------------------------------------|-------------------------------------------------------------------|
| `validate layout --file=layout.json`                                  | Validate a layout file (checks block types and fields)            |
| `validate block --block=block.json --schema=schema.json`              | Validate a block instance against a specific block schema         |
| `validate structure --file=structure.json`                            | Validate a structure definition                                   |

Each command prints a summary and lists any errors or warnings found.  
Exit code is `1` if any validation errors are present.