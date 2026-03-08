import {
    listWebhooks,
    getWebhook,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    rotateSecret,
    sendTestPing,
    getDeliveryLog,
    retryDelivery
} from '@moteur/core/webhooks/webhookService.js';
import type { WebhookEvent } from '@moteur/types/Webhook.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

const VALID_EVENTS: WebhookEvent[] = [
    'entry.created',
    'entry.updated',
    'entry.published',
    'entry.unpublished',
    'entry.deleted',
    'asset.created',
    'asset.updated',
    'asset.deleted',
    'page.published',
    'page.unpublished',
    'page.deleted',
    'review.submitted',
    'review.approved',
    'review.rejected',
    'comment.created',
    'form.submitted'
];

function projectIdFromArgs(
    args: { project?: string; projectId?: string },
    user: User
): Promise<string> {
    const id = args.project ?? args.projectId;
    if (id) return Promise.resolve(id as string);
    return projectSelectPrompt(user);
}

export async function listWebhooksCommand(args: {
    project?: string;
    projectId?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const list = await listWebhooks(projectId);
    if (args.json) return console.log(JSON.stringify(list, null, 2));
    if (list.length === 0 && !args.quiet) {
        console.log(`No webhooks in project "${projectId}".`);
        return;
    }
    if (!args.quiet) {
        console.log(`Webhooks in project "${projectId}":`);
        list.forEach(w => {
            console.log(`  ${w.id}  ${w.name}  ${w.url}  enabled=${w.enabled}`);
        });
    }
}

export async function getWebhookCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const id = args.id as string;
    if (!id) throw new Error('--id is required');
    const webhook = await getWebhook(projectId, id);
    if (args.json) return console.log(JSON.stringify(webhook, null, 2));
    if (!args.quiet) console.log(JSON.stringify(webhook, null, 2));
}

export async function createWebhookCommand(args: {
    project?: string;
    projectId?: string;
    name?: string;
    url?: string;
    secret?: string;
    events?: string;
    enabled?: boolean | string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const name = (args.name as string)?.trim();
    const url = (args.url as string)?.trim();
    if (!name) throw new Error('--name is required');
    if (!url) throw new Error('--url is required');
    const events = args.events
        ? ((args.events as string)
              .split(',')
              .map(s => s.trim())
              .filter(Boolean) as WebhookEvent[])
        : undefined;
    if (events?.length) {
        for (const e of events) {
            if (!VALID_EVENTS.includes(e)) throw new Error(`Invalid event: ${e}`);
        }
    }
    const enabled =
        args.enabled === undefined ? true : args.enabled === true || args.enabled === 'true';
    const webhook = await createWebhook(projectId, user.id, {
        name,
        url,
        secret: args.secret as string | undefined,
        events,
        enabled
    });
    if (args.json) return console.log(JSON.stringify(webhook, null, 2));
    if (!args.quiet) {
        console.log(`Created webhook "${webhook.name}" (${webhook.id}).`);
        console.log('Secret (shown once):', (webhook as { secret?: string }).secret);
    }
}

export async function updateWebhookCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    name?: string;
    url?: string;
    enabled?: boolean | string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const id = args.id as string;
    if (!id) throw new Error('--id is required');
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = (args.name as string).trim();
    if (args.url !== undefined) patch.url = (args.url as string).trim();
    if (args.enabled !== undefined) {
        patch.enabled = args.enabled === true || args.enabled === 'true';
    }
    const webhook = await updateWebhook(projectId, user.id, id, patch);
    if (args.json) return console.log(JSON.stringify(webhook, null, 2));
    if (!args.quiet) console.log(`Updated webhook "${webhook.name}".`);
}

export async function deleteWebhookCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const id = args.id as string;
    if (!id) throw new Error('--id is required');
    await deleteWebhook(projectId, user.id, id);
    if (!args.quiet) console.log(`Deleted webhook "${id}".`);
}

export async function rotateSecretCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const id = args.id as string;
    if (!id) throw new Error('--id is required');
    const { secret } = await rotateSecret(projectId, user.id, id);
    if (args.json) return console.log(JSON.stringify({ secret }, null, 2));
    if (!args.quiet) {
        console.log('New secret (shown once):', secret);
    }
}

export async function testWebhookCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const id = args.id as string;
    if (!id) throw new Error('--id is required');
    const delivery = await sendTestPing(projectId, id);
    if (args.json) return console.log(JSON.stringify(delivery, null, 2));
    if (!args.quiet) {
        console.log(`Test delivery: ${delivery.status} (HTTP ${delivery.responseStatus ?? 'n/a'})`);
        if (delivery.responseBody) console.log('Response:', delivery.responseBody.slice(0, 200));
    }
}

export async function logWebhooksCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    limit?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const id = args.id as string;
    if (!id) throw new Error('--id is required (webhook id)');
    const limit = Math.min(parseInt(args.limit as string, 10) || 20, 100);
    const list = await getDeliveryLog(projectId, id, { limit, offset: 0 });
    if (args.json) return console.log(JSON.stringify(list, null, 2));
    if (!args.quiet) {
        console.log(`Delivery log for webhook "${id}" (${list.length}):`);
        list.forEach(d => {
            console.log(
                `  ${d.id}  ${d.event}  ${d.status}  ${d.responseStatus ?? '-'}  ${d.createdAt}`
            );
        });
    }
}

export async function retryDeliveryCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    deliveryId?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const id = args.id as string;
    const deliveryId = args.deliveryId as string;
    if (!id) throw new Error('--id is required (webhook id)');
    if (!deliveryId) throw new Error('--deliveryId is required');
    await retryDelivery(projectId, id, deliveryId);
    if (!args.quiet) console.log(`Retry enqueued for delivery ${deliveryId}.`);
}

cliRegistry.register('webhooks', {
    name: 'list',
    description: 'List webhooks (--project)',
    action: listWebhooksCommand
});
cliRegistry.register('webhooks', {
    name: 'get',
    description: 'Get a webhook (--project, --id)',
    action: getWebhookCommand
});
cliRegistry.register('webhooks', {
    name: 'create',
    description: 'Create a webhook (--project, --name, --url, --events?, --enabled?)',
    action: createWebhookCommand
});
cliRegistry.register('webhooks', {
    name: 'update',
    description: 'Update a webhook (--project, --id, --name?, --url?, --enabled?)',
    action: updateWebhookCommand
});
cliRegistry.register('webhooks', {
    name: 'delete',
    description: 'Delete a webhook (--project, --id)',
    action: deleteWebhookCommand
});
cliRegistry.register('webhooks', {
    name: 'rotate-secret',
    description: 'Rotate webhook secret (--project, --id)',
    action: rotateSecretCommand
});
cliRegistry.register('webhooks', {
    name: 'test',
    description: 'Send a test ping (--project, --id)',
    action: testWebhookCommand
});
cliRegistry.register('webhooks', {
    name: 'log',
    description: 'Show delivery log (--project, --id, --limit?)',
    action: logWebhooksCommand
});
cliRegistry.register('webhooks', {
    name: 'retry',
    description: 'Retry a failed delivery (--project, --id, --deliveryId)',
    action: retryDeliveryCommand
});
