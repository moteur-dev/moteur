#!/usr/bin/env ts-node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

import { cliRegistry } from '@moteur/core/registry/CommandRegistry';
import { showMainMenu } from './menu/mainMenu';

// Import all fields to ensure they are registered
import '@moteur/core/fields';

// Import commands so they self-register
import './commands/auth.js';
import './commands/project.js';
import './commands/models.js';
import './commands/layout.js';
import './commands/structures.js';
import './commands/fields.js';
import './commands/blocks.js';
import './commands/entries.js';
import { showHelp, showCommandHelp } from './commands/help';

const [command, subcommand, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(
    rest.map(arg => {
        const [key, value] = arg.replace(/^--/, '').split('=');
        return [key, value ?? true];
    })
) as Record<string, any>;

export async function runCli() {
    try {
        // No command → show main menu
        if (!command) {
            await showMainMenu();
            return;
        }

        if (command === 'help') {
            if (subcommand) {
                return showCommandHelp(subcommand);
            }
            return showHelp();
        }

        // Unknown top-level command?
        if (!cliRegistry.has(command)) {
            console.error(`Unknown command: ${command}`);
            return showHelp();
        }

        // Determine which subcommand (or default) to run
        let cmdDef;
        if (!subcommand) {
            try {
                cmdDef = cliRegistry.get(command, ''); // default action
            } catch {
                return showCommandHelp(command);
            }
        } else {
            // subcommand provided
            if (!cliRegistry.has(command, subcommand)) {
                console.error(`Unknown subcommand: ${command} ${subcommand}`);
                return showCommandHelp(command);
            }
            cmdDef = cliRegistry.get(command, subcommand);
        }

        // execute
        await cmdDef.action(args);
    } catch (err: any) {
        console.error('❌ Error:', err.message || err);
        process.exit(1);
    }
}

(async () => {
    runCli();
})();
