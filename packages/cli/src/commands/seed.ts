import { runSeed } from '@moteur/core/seed.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

export async function seedCommand(args: { force?: boolean; json?: boolean; quiet?: boolean }) {
    try {
        const { copied, skipped } = runSeed({ force: !!args.force });
        if (args.json) {
            console.log(JSON.stringify({ copied, skipped }, null, 2));
            return;
        }
        if (!args.quiet) {
            if (copied.length > 0) {
                console.log('Seeded blueprints:');
                copied.forEach(f => console.log(`  + ${f}`));
            }
            if (skipped.length > 0) {
                console.log('Skipped (already exist; use --force to overwrite):');
                skipped.forEach(f => console.log(`  - ${f}`));
            }
            if (copied.length === 0 && skipped.length === 0) {
                console.log('No seed files found under data/seeds/blueprints/');
            }
        }
    } catch (err: any) {
        console.error(err.message ?? err);
        throw err;
    }
}

cliRegistry.register('seed', {
    name: '',
    description:
        'Copy blueprint seeds from data/seeds/blueprints/ to data/blueprints/ (only when missing)',
    action: seedCommand
});
