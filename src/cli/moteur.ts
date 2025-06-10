#!/usr/bin/env ts-node

import { runValidateCommand } from './commands/validate.js';

import { loginCommand, logoutCommand, createUserCommand } from './commands/auth.js';

import {
    listProjectsCommand,
    getProjectCommand,
    createProjectCommand,
    patchProjectCommand,
    deleteProjectCommand
} from './commands/project.js';

import {
    listLayoutsCommand,
    createLayoutCommand,
    patchLayoutCommand,
    deleteLayoutCommand,
    getLayoutCommand
} from './commands/layout.js';

import {
    listStructuresCommand,
    getStructureCommand,
    createStructureCommand,
    patchStructureCommand,
    deleteStructureCommand
} from './commands/structures.js';

import { listFieldsCommand } from './commands/fields.js';

import { listBlocksCommand } from './commands/blocks.js';

import {
    listModelSchemasCommand,
    getModelSchemaCommand,
    createModelSchemaCommand,
    patchModelSchemaCommand,
    deleteModelSchemaCommand
} from './commands/models.js';

import {
    listEntriesCommand,
    getEntryCommand,
    createEntryCommand,
    patchEntryCommand,
    deleteEntryCommand,
    validateEntryCommand,
    validateAllEntriesCommand
} from './commands/entries.js';

import { showMainMenu } from './menu/mainMenu.js';
import { showModelSchemasMenu } from './menu/modelsMenu.js';
import { showProjectsMenu } from './menu/projectsMenu.js';
//import { showStructuresMenu } from './menu/structuresMenu.js';
import { showEntriesMenu } from './menu/entriesMenu.js';
import { showAuthMenu } from './menu/authMenu.js';

const [command, subcommand, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(
    rest.map(arg => {
        const [key, value] = arg.replace(/^--/, '').split('=');
        return [key, value ?? true];
    })
) as { [key: string]: string | boolean };

const globalFlags = {
    json: args.json === true || args.json === 'true',
    quiet: args.quiet === true || args.quiet === 'true'
};

// If in JSON mode, force quiet mode
if (globalFlags.json) {
    globalFlags.quiet = true;
}

(async () => {
    try {
        // Show main menu if no command is provided
        if (!command) {
            return showMainMenu();
        }

        // Validation
        if (command === 'validate') {
            await runValidateCommand(subcommand, args);
        }

        if (command === 'auth') {
            if (!subcommand) {
                showAuthMenu();
                return;
            }
            if (subcommand === 'login') {
                return loginCommand();
            }
            if (subcommand === 'logout') {
                return logoutCommand();
            }
            if (subcommand === 'whoami') {
                console.log('Fetching current user info...');
                // Implement whoami logic here
                return;
            }
            if (subcommand === 'create-user') {
                return createUserCommand();
            }

        }

        // Projects
        if (command === 'projects') {
            if (!subcommand) {
                return showProjectsMenu();
            }
            if (subcommand === 'list') {
                return listProjectsCommand(globalFlags);
            }
            if (subcommand === 'get')
                return getProjectCommand({
                    id: args.id as string,
                    ...globalFlags
                });
            if (subcommand === 'create')
                return createProjectCommand({
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'patch')
                return patchProjectCommand({
                    id: args.id as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'delete')
                return deleteProjectCommand({
                    id: args.id as string,
                    ...globalFlags
                });
        }

        // Layouts
        if (command === 'layouts') {
            /*if (!subcommand) {
                return showStructuresMenu();
            }*/
            if (subcommand === 'list')
                return listLayoutsCommand({
                    project: args.project as string,
                    ...globalFlags
                });
            if (subcommand === 'get')
                return getLayoutCommand({
                    project: args.project as string,
                    id: args.id as string,
                    ...globalFlags
                });
            if (subcommand === 'create')
                return createLayoutCommand({
                    project: args.project as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'patch')
                return patchLayoutCommand({
                    project: args.project as string,
                    id: args.id as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'delete')
                return deleteLayoutCommand({
                    project: args.project as string,
                    id: args.id as string,
                    ...globalFlags
                });
            if (subcommand === 'render') {
                console.error('The "render" command is not implemented yet.');
                return;
            }
        }

        // Structures
        if (command === 'structures') {
            if (subcommand === 'list') return listStructuresCommand(globalFlags);
            if (subcommand === 'get')
                return getStructureCommand({
                    id: args.id as string,
                    ...globalFlags
                });
            if (subcommand === 'create')
                return createStructureCommand({
                    project: args.project as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'patch')
                return patchStructureCommand({
                    project: args.project as string,
                    id: args.id as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'delete')
                return deleteStructureCommand({
                    project: args.project as string,
                    id: args.id as string,
                    ...globalFlags
                });
        }

        // Fields
        if (command === 'fields' && subcommand === 'list') {
            return listFieldsCommand(globalFlags);
        }

        // Blocks
        if (command === 'blocks' && subcommand === 'list') {
            return listBlocksCommand({ project: args.project as string, ...globalFlags });
        }

        // Models
        if (command === 'models') {
            if (!subcommand) {
                showModelSchemasMenu(args.project as string);
                return;
            }
            if (subcommand === 'list')
                return listModelSchemasCommand({
                    projectId: args.project as string,
                    ...globalFlags
                });
            if (subcommand === 'get')
                return getModelSchemaCommand({
                    projectId: args.project as string,
                    id: args.id as string,
                    ...globalFlags
                });
            if (subcommand === 'create')
                return createModelSchemaCommand({
                    projectId: args.project as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'patch')
                return patchModelSchemaCommand({
                    projectId: args.project as string,
                    id: args.id as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            if (subcommand === 'delete')
                return deleteModelSchemaCommand({
                    projectId: args.project as string,
                    id: args.id as string,
                    ...globalFlags
                });
        }

        if (command === 'entries') {
            if (!subcommand) {
                showEntriesMenu(args.project as string, args.model as string);
                return;
            }
            if (subcommand === 'list') {
                return listEntriesCommand({
                    projectId: args.project as string,
                    model: args.model as string,
                    ...globalFlags
                });
            }
            if (subcommand === 'get') {
                return getEntryCommand({
                    projectId: args.project as string,
                    model: args.model as string,
                    id: args.id as string,
                    ...globalFlags
                });
            }
            if (subcommand === 'create') {
                return createEntryCommand({
                    projectId: args.project as string,
                    model: args.model as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            }
            if (subcommand === 'patch') {
                return patchEntryCommand({
                    projectId: args.project as string,
                    model: args.model as string,
                    id: args.id as string,
                    file: args.file as string,
                    data: args.data as string,
                    ...globalFlags
                });
            }
            if (subcommand === 'delete') {
                return deleteEntryCommand({
                    projectId: args.project as string,
                    model: args.model as string,
                    id: args.id as string,
                    ...globalFlags
                });
            }
            if (subcommand === 'validate') {
                if (args.id) {
                    return validateEntryCommand({
                        projectId: args.project as string,
                        model: args.model as string,
                        id: args.id as string,
                        //file: args.file as string,
                        //data: args.data as string,
                        ...globalFlags
                    });
                } else {
                    return validateAllEntriesCommand({
                        projectId: args.project as string,
                        model: args.model as string,
                        //file: args.file as string,
                        //data: args.data as string,
                        ...globalFlags
                    });
                }
            }
        }

        console.error(`Unknown command: ${command} ${subcommand}`);
        process.exit(1);
    } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') {
            console.log('👋 until next time!'); // noop; silence this error
        } else {
            if (!globalFlags.quiet) {
                console.error('❌ Error:', err);
            }
        }
        process.exit(1);
    }
})();
