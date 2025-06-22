"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showHelp = showHelp;
exports.showCommandHelp = showCommandHelp;
var CommandRegistry_1 = require("@moteur/core/registry/CommandRegistry");
// Show full help
function showHelp() {
    console.log('\nUsage: moteur <command> [subcommand] [--flags]\n');
    console.log('Commands:');
    CommandRegistry_1.cliRegistry.listCommands().forEach(function (cmd) {
        var subs = CommandRegistry_1.cliRegistry.listSubcommands(cmd);
        if (subs.length) {
            console.log("  ".concat(cmd));
            subs.forEach(function (s) {
                var _a;
                var name = s.name || '<default>';
                console.log("    ".concat(name.padEnd(10), "  ").concat((_a = s.description) !== null && _a !== void 0 ? _a : ''));
            });
        }
        else {
            console.log("  ".concat(cmd));
        }
    });
    console.log('\nRun `moteur help <command>` for details on a specific command.\n');
}
// Show help for a specific command
function showCommandHelp(cmd) {
    if (!CommandRegistry_1.cliRegistry.has(cmd)) {
        console.error("Unknown command: ".concat(cmd));
        return showHelp();
    }
    console.log("\nmoteur ".concat(cmd, " <subcommand> [--flags]\n"));
    var subs = CommandRegistry_1.cliRegistry.listSubcommands(cmd);
    if (!subs.length) {
        console.log('  (no subcommands registered)');
    }
    else {
        console.log('Subcommands:');
        subs.forEach(function (s) {
            var _a;
            var name = s.name || '<default>';
            console.log("  ".concat(name.padEnd(10), "  ").concat((_a = s.description) !== null && _a !== void 0 ? _a : ''));
        });
    }
    console.log('');
}
