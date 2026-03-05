import {
    addComment,
    getComments,
    resolveComment,
    deleteComment,
    editComment
} from '@moteur/core/comments.js';
import { cliLoadUser } from '../utils/auth.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import type { User } from '@moteur/types/User.js';
import type { CommentResourceType } from '@moteur/types/Comment.js';

const RESOURCE_TYPES: CommentResourceType[] = ['entry', 'layout'];

export async function listCommentsCommand(args: {
    projectId?: string;
    resourceType?: string;
    resourceId?: string;
    fieldPath?: string;
    includeResolved?: boolean | string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.resourceType || !args.resourceId) {
        console.error(
            '❌ --resource-type and --resource-id are required (e.g. --resource-type=entry --resource-id=article__e1).'
        );
        return;
    }
    if (!RESOURCE_TYPES.includes(args.resourceType as CommentResourceType)) {
        console.error(`❌ resource-type must be one of: ${RESOURCE_TYPES.join(', ')}`);
        return;
    }
    const includeResolved =
        args.includeResolved === true ||
        args.includeResolved === 'true' ||
        args.includeResolved === '1';
    const comments = await getComments(
        args.projectId,
        args.resourceType as CommentResourceType,
        args.resourceId,
        {
            includeResolved,
            ...(args.fieldPath != null && { fieldPath: args.fieldPath })
        }
    );
    if (args.json) return console.log(JSON.stringify(comments, null, 2));
    if (!args.quiet) {
        console.log(
            `💬 Comments for ${args.resourceType}/${args.resourceId} in project "${args.projectId}" (${comments.length}):`
        );
        comments.forEach(c => {
            const meta = [c.resolved ? '✓' : '○', c.authorName, c.createdAt].join(' ');
            console.log(
                `  ${c.id.slice(0, 8)}… ${meta}  ${c.body.slice(0, 60)}${c.body.length > 60 ? '…' : ''}`
            );
        });
    }
}

export async function addCommentCommand(args: {
    projectId?: string;
    resourceType?: string;
    resourceId?: string;
    fieldPath?: string;
    blockId?: string;
    parentId?: string;
    body?: string;
    file?: string;
    data?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.resourceType || !args.resourceId) {
        console.error('❌ --resource-type and --resource-id are required.');
        return;
    }
    if (!RESOURCE_TYPES.includes(args.resourceType as CommentResourceType)) {
        console.error(`❌ resource-type must be one of: ${RESOURCE_TYPES.join(', ')}`);
        return;
    }
    let body: string;
    if (args.body != null && args.body !== '') {
        body = String(args.body).trim();
    } else if (args.file || args.data) {
        const resolved = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: []
        });
        body = typeof resolved?.body === 'string' ? resolved.body : JSON.stringify(resolved);
        if (!body.trim()) {
            console.error(
                '❌ body is required. Use --body=... or --file / --data with a JSON object containing "body".'
            );
            return;
        }
    } else {
        console.error(
            '❌ --body is required (or use --file / --data with JSON containing "body").'
        );
        return;
    }
    const comment = await addComment(args.projectId, user, {
        resourceType: args.resourceType as CommentResourceType,
        resourceId: args.resourceId,
        ...(args.fieldPath != null && { fieldPath: args.fieldPath }),
        ...(args.blockId != null && { blockId: args.blockId }),
        ...(args.parentId != null && { parentId: args.parentId }),
        body
    });
    if (args.json) return console.log(JSON.stringify(comment, null, 2));
    if (!args.quiet) {
        console.log(`✅ Comment added (${comment.id}) on ${args.resourceType}/${args.resourceId}.`);
    }
}

export async function resolveCommentCommand(args: {
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.id) {
        console.error('❌ --id is required (comment ID).');
        return;
    }
    const comment = await resolveComment(args.projectId, user, args.id);
    if (args.json) return console.log(JSON.stringify(comment, null, 2));
    if (!args.quiet) {
        console.log(`✅ Comment ${args.id} marked as resolved.`);
    }
}

export async function deleteCommentCommand(args: {
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.id) {
        console.error('❌ --id is required (comment ID).');
        return;
    }
    await deleteComment(args.projectId, user, args.id);
    if (!args.quiet) {
        console.log(`🗑️ Comment ${args.id} deleted.`);
    }
}

export async function editCommentCommand(args: {
    projectId?: string;
    id?: string;
    body?: string;
    file?: string;
    data?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.id) {
        console.error('❌ --id is required (comment ID).');
        return;
    }
    let body: string;
    if (args.body != null && args.body !== '') {
        body = String(args.body).trim();
    } else if (args.file || args.data) {
        const resolved = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: []
        });
        body = typeof resolved?.body === 'string' ? resolved.body : JSON.stringify(resolved);
        if (!body.trim()) {
            console.error(
                '❌ body is required. Use --body=... or --file / --data with JSON containing "body".'
            );
            return;
        }
    } else {
        console.error(
            '❌ --body is required (or use --file / --data with JSON containing "body").'
        );
        return;
    }
    const comment = await editComment(args.projectId, user, args.id, body);
    if (args.json) return console.log(JSON.stringify(comment, null, 2));
    if (!args.quiet) {
        console.log(`✅ Comment ${args.id} updated.`);
    }
}

cliRegistry.register('comments', {
    name: 'list',
    description: 'List comments for a resource (entry or layout)',
    action: listCommentsCommand
});

cliRegistry.register('comments', {
    name: 'add',
    description: 'Add a comment',
    action: addCommentCommand
});

cliRegistry.register('comments', {
    name: 'resolve',
    description: 'Mark a comment as resolved',
    action: resolveCommentCommand
});

cliRegistry.register('comments', {
    name: 'delete',
    description: 'Delete a comment (author or admin only)',
    action: deleteCommentCommand
});

cliRegistry.register('comments', {
    name: 'edit',
    description: 'Edit a comment body (author only)',
    action: editCommentCommand
});
