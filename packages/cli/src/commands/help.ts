import { cliRegistry } from '@moteur/core/registry/CommandRegistry';

// Show full help
export function showHelp() {
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
export function showCommandHelp(cmd: string) {
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
