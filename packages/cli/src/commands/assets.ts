import {
    listAssets,
    getAsset,
    deleteAsset,
    regenerateVariants,
    migrateProvider,
    getAssetConfig,
    updateAssetConfig
} from '@moteur/core/assets/assetService.js';
import { cliLoadUser } from '../utils/auth.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import type { User } from '@moteur/types/User.js';

export async function listAssetsCommand(args: {
    project?: string;
    type?: string;
    folder?: string;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? (await projectSelectPrompt(user));
    if (!projectId) {
        console.error('❌ --project is required');
        return;
    }
    const assets = await listAssets(projectId, {
        type: args.type as any,
        folder: args.folder
    });
    if (args.json) return console.log(JSON.stringify(assets, null, 2));
    if (assets.length === 0) {
        console.log('No assets found.');
        return;
    }
    console.log(`Assets (${assets.length}):`);
    assets.forEach(a => console.log(`  ${a.id}  ${a.filename}  ${a.type}`));
}

export async function getAssetCommand(args: { project?: string; id?: string; json?: boolean }) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? (await projectSelectPrompt(user));
    if (!projectId || !args.id) {
        console.error('❌ --project and --id are required');
        return;
    }
    const asset = await getAsset(projectId, args.id);
    if (!asset) {
        console.error('Asset not found.');
        return;
    }
    if (args.json) return console.log(JSON.stringify(asset, null, 2));
    console.log(asset);
}

export async function deleteAssetCommand(args: { project?: string; id?: string }) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? (await projectSelectPrompt(user));
    if (!projectId || !args.id) {
        console.error('❌ --project and --id are required');
        return;
    }
    await deleteAsset(projectId, user, args.id);
    console.log('Asset deleted.');
}

export async function regenerateAssetsCommand(args: {
    project?: string;
    id?: string | string[];
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? (await projectSelectPrompt(user));
    if (!projectId) {
        console.error('❌ --project is required');
        return;
    }
    const ids = args.id ? (Array.isArray(args.id) ? args.id : [args.id]) : undefined;
    const result = await regenerateVariants(projectId, user, ids);
    if (args.json) return console.log(JSON.stringify(result, null, 2));
    console.log(`Done. ${result.processed} processed, ${result.errors} errors.`);
}

export async function configAssetsCommand(args: {
    project?: string;
    setAdapter?: string;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? (await projectSelectPrompt(user));
    if (!projectId) {
        console.error('❌ --project is required');
        return;
    }
    if (args.setAdapter) {
        await updateAssetConfig(projectId, user, { adapter: args.setAdapter as any });
        console.log(`Adapter set to ${args.setAdapter}.`);
        return;
    }
    const config = await getAssetConfig(projectId, user);
    if (args.json) return console.log(JSON.stringify(config, null, 2));
    console.log(JSON.stringify(config, null, 2));
}

export async function migrateProviderCommand(args: {
    to?: string;
    from?: string;
    project?: string | string[];
    keepLocalCopy?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.to) {
        console.error('❌ --to is required (mux | vimeo | local)');
        return;
    }
    const projectIds = args.project
        ? Array.isArray(args.project)
            ? args.project
            : [args.project]
        : undefined;
    console.log(`Migrating videos to ${args.to}...`);
    const result = await migrateProvider(user, {
        fromProvider: args.from as any,
        toProvider: args.to as any,
        projectIds,
        keepLocalCopy: args.keepLocalCopy
    });
    if (args.json) return console.log(JSON.stringify(result, null, 2));
    console.log(
        `Done. ${result.processed} processed, ${result.errors} errors, ${result.skipped} skipped.`
    );
}

cliRegistry.register('assets', {
    name: 'list',
    description: 'List project assets',
    action: listAssetsCommand
});
cliRegistry.register('assets', {
    name: 'get',
    description: 'Get a single asset',
    action: getAssetCommand
});
cliRegistry.register('assets', {
    name: 'delete',
    description: 'Delete an asset',
    action: deleteAssetCommand
});
cliRegistry.register('assets', {
    name: 'regenerate',
    description: 'Regenerate image variants',
    action: regenerateAssetsCommand
});
cliRegistry.register('assets', {
    name: 'config',
    description: 'Get or set asset config (e.g. --set-adapter=s3)',
    action: configAssetsCommand
});
cliRegistry.register('assets', {
    name: 'migrate-provider',
    description: 'Migrate video provider (instance-wide)',
    action: migrateProviderCommand
});
