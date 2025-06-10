
# Random notes

- Core Source plugins
  - plugins/source/file-json
  - plugins/source/dir-json

- More Source plugins
  - plugins/source-api-rest
  - plugins/source-api-graphql
  - plugins/source-file-csv
  - plugins/source-db-mongodb
  - plugins/source-db-postgresql

- Move writeJson operations to source plugin

- File operations (creating empty dir, etc) should be handled by plugins

- plugins/search-indexer-algolia
- plugins/search-indexer-elasticsearch
- plugins/storage-s3
- plugins/media-image-processor-cloudflare
- plugins-media-image-processor-aws

- GraphQL API

# CLI

## Auth

⚠️ `cli auth` should open the auth interactive menu
⚠️ `cli auth login` should prompt for login (username + password)
⚠️ `cli auth logout` should logout currently logged-in CLI user

## Projects

✅ `cli projects list --json` should return the full JSON array of all projects
⚠️ `cli projects list` should display a table ID | Label | Description and maybe some optional things (like number of models, layouts or whatever)
  ❗It currently shows a simple list of ID + Label
✅ `cli projects create` without arguments shod the interactive projects creation mode. Entering all fields validate and create the project.
⚠️ `cli projects create` show a summary of the data before saving.
  ❗ It currently saves directly without confirmation.
⚠️ Creating a new project with the interactive CLI: before saving, it should ask for confirmation and possibility of going back to edit project information.
✅ `cli projects patch` without any parameters let you select the project you want to edit (interactive)
✅ `cli projects patch` allows editing all fields interactively
⚠️ `cli projects patch --project` should let you edit without prompting for a project.
⚠️ `cli projects patch` in interactive mode should show the previous data and use it by default.
  ❗It currently shows emtpy prompt, so we can not know what was the previous value.
⚠️ `cli projects delete` moves project to trash and confirms


## Models

✅ `cli models list --project` shows list of model (schemas) in a project
✅ `cli models list` without --project prompts for a project
✅ `cli models list --project` should display the list without asking for project prompt.
⚠️ `cli models list --project` should display as a table
⚠️ `cli models list --project --json` should return the full JSON of all model schemas of a project
⚠️ `cli models create` without a project asks for the project interactively.
⚠️ `cli models create --project` shows thes interactive model schema creation mode. Entering all fields validate and create teh schema.

## Entries