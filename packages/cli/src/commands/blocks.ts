import { listBlocks } from '@moteur/core/blocks.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

export async function listBlocksCommand(args: {
    project?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const blocks = listBlocks(args.project);
    if (args.json) {
        console.log(JSON.stringify(blocks, null, 2));
    } else if (!args.quiet) {
        console.log(
            `📦 Available block types${args.project ? ' for project ' + args.project : ''}:`
        );
        Object.values(blocks).forEach(block => {
            console.log(`- ${block.type} \t (${block.label}) \t\t- ${block.description}`);
        });
    }
}

cliRegistry.register('blocks', {
    name: '',
    description: 'List all available block types',
    action: listBlocksCommand
});

cliRegistry.register('blocks', {
    name: 'list',
    description: 'List all available block types',
    action: listBlocksCommand
});
