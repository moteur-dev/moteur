#!/usr/bin/env ts-node

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

import { cliRegistry } from '../registry/CommandRegistry';
import { showMainMenu } from './menu/mainMenu';

// Import all fields to ensure they are registered
import '@/fields';

// Import commands so they self-register
import './commands/auth';
import './commands/project';
import './commands/models';
import './commands/layout';
import './commands/structures';
import './commands/fields';
import './commands/blocks';

import './commands/entries';

const [command, subcommand, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(
    rest.map(arg => {
        const [key, value] = arg.replace(/^--/, '').split('=');
        return [key, value ?? true];
    })
) as Record<string, any>;

// Show full help
function showHelp() {
    console.log('\nUsage: moteur <command> [subcommand] [--flags]\n');
    console.log('Commands:');
    cliRegistry.listCommands().forEach(cmd => {
        const subs = cliRegistry.listSubcommands(cmd);
        if (subs.length) {
            console.log(`  ${cmd}`);
            subs.forEach(s => {
                const name = s.name || '<default>';
                console.log(`    ${name.padEnd(10)}  ${s.description ?? ''}`);
            });
        } else {
            console.log(`  ${cmd}`);
        }
    });
    console.log('\nRun `moteur help <command>` for details on a specific command.\n');
}

// Show help for a specific command
function showCommandHelp(cmd: string) {
    if (!cliRegistry.has(cmd)) {
        console.error(`Unknown command: ${cmd}`);
        return showHelp();
    }
    console.log(`\nmoteur ${cmd} <subcommand> [--flags]\n`);
    const subs = cliRegistry.listSubcommands(cmd);
    if (!subs.length) {
        console.log('  (no subcommands registered)');
    } else {
        console.log('Subcommands:');
        subs.forEach(s => {
            const name = s.name || '<default>';
            console.log(`  ${name.padEnd(10)}  ${s.description ?? ''}`);
        });
    }
    console.log('');
}

(async () => {
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
})();
