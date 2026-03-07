// utils/eventBus.ts
import type { ActivityEvent } from '@moteur/types/Activity.js';
import type { BlueprintSchema } from '@moteur/types/Blueprint.js';
import type { Comment } from '@moteur/types/Comment.js';
import type { Review } from '@moteur/types/Review.js';
import type { EntryStatus } from '@moteur/types/Model.js';
import { ProjectSchema } from '@moteur/types/Project.js';
import { ModelSchema, Entry } from '@moteur/types/Model.js';
import { Layout } from '@moteur/types/Layout.js';
import { Block } from '@moteur/types/Block.js';
import { StructureSchema } from '@moteur/types/Structure.js';
import type { TemplateSchema } from '@moteur/types/Template.js';
import type { Page } from '@moteur/types/Page.js';
import { User } from '@moteur/types/User.js';
import type { Asset } from '@moteur/types/Asset.js';

// Event context uses explicit resource keys (like { project, user }) for clarity.
export interface EventMap {
    // Projects
    'project.beforeCreate': { project: ProjectSchema; user: User };
    'project.afterCreate': { project: ProjectSchema; user: User };
    'project.beforeUpdate': { project: ProjectSchema; user: User };
    'project.afterUpdate': { project: ProjectSchema; user: User };
    'project.beforeDelete': { project: ProjectSchema; user: User };
    'project.afterDelete': { project: ProjectSchema; user: User };

    // Models (projectId for activity log)
    'model.beforeCreate': { model: ModelSchema; user: User; projectId: string };
    'model.afterCreate': { model: ModelSchema; user: User; projectId: string };
    'model.beforeUpdate': { model: ModelSchema; user: User; projectId: string };
    'model.afterUpdate': { model: ModelSchema; user: User; projectId: string };
    'model.beforeDelete': { model: ModelSchema; user: User; projectId: string };
    'model.afterDelete': { model: ModelSchema; user: User; projectId: string };

    // Entries (projectId and modelId for activity log)
    'entry.beforeCreate': { entry: Entry; user: User; modelId: string; projectId: string };
    'entry.afterCreate': { entry: Entry; user: User; modelId: string; projectId: string };
    'entry.beforeUpdate': { entry: Entry; user: User; modelId: string; projectId: string };
    'entry.afterUpdate': { entry: Entry; user: User; modelId: string; projectId: string };
    'entry.beforeDelete': { entry: Entry; user: User; modelId: string; projectId: string };
    'entry.afterDelete': { entry: Entry; user: User; modelId: string; projectId: string };

    // Layouts (projectId for activity log)
    'layout.beforeCreate': { layout: Layout; user: User; projectId: string };
    'layout.afterCreate': { layout: Layout; user: User; projectId: string };
    'layout.beforeUpdate': { layout: Layout; user: User; projectId: string };
    'layout.afterUpdate': { layout: Layout; user: User; projectId: string };
    'layout.beforeDelete': { layout: Layout; user: User; projectId: string };
    'layout.afterDelete': { layout: Layout; user: User; projectId: string };

    // Templates (projectId for activity log)
    'template.beforeCreate': { template: TemplateSchema; user: User; projectId: string };
    'template.afterCreate': { template: TemplateSchema; user: User; projectId: string };
    'template.beforeUpdate': { template: TemplateSchema; user: User; projectId: string };
    'template.afterUpdate': { template: TemplateSchema; user: User; projectId: string };
    'template.beforeDelete': { template: TemplateSchema; user: User; projectId: string };
    'template.afterDelete': { template: TemplateSchema; user: User; projectId: string };

    // Pages (projectId for activity log)
    'page.beforeCreate': { page: Page; user: User; projectId: string };
    'page.afterCreate': { page: Page; user: User; projectId: string };
    'page.beforeUpdate': { page: Page; user: User; projectId: string };
    'page.afterUpdate': { page: Page; user: User; projectId: string };
    'page.beforeDelete': { page: Page; user: User; projectId: string };
    'page.afterDelete': { page: Page; user: User; projectId: string };

    // Blocks
    'block.created': { block: Block; user: User };

    // Structures (projectId for activity log)
    'structure.beforeCreate': { structure: StructureSchema; user: User; projectId: string };
    'structure.afterCreate': { structure: StructureSchema; user: User; projectId: string };
    'structure.beforeUpdate': { structure: StructureSchema; user: User; projectId: string };
    'structure.afterUpdate': { structure: StructureSchema; user: User; projectId: string };
    'structure.beforeDelete': { structure: StructureSchema; user: User; projectId: string };
    'structure.afterDelete': { structure: StructureSchema; user: User; projectId: string };

    // Users (performedBy = actor who created/updated/deleted the user)
    'user.beforeCreate': { user: User; performedBy?: User };
    'user.afterCreate': { user: User; performedBy?: User };
    'user.beforeUpdate': { user: User; performedBy?: User };
    'user.afterUpdate': { user: User; performedBy?: User };
    'user.beforeDelete': { user: User; performedBy?: User };
    'user.afterDelete': { user: User; performedBy?: User };

    // Blueprints (user = actor)
    'blueprint.afterCreate': { blueprint: BlueprintSchema; user: User };
    'blueprint.afterUpdate': { blueprint: BlueprintSchema; user: User };
    'blueprint.afterDelete': { blueprint: BlueprintSchema; user: User };

    // Activity (emitted after an event is persisted to the activity log)
    'activity.logged': { event: ActivityEvent };

    // Comments (emitted after comment mutations for real-time broadcast)
    'comment.added': { projectId: string; comment: Comment };
    'comment.resolved': { projectId: string; comment: Comment };
    'comment.deleted': { projectId: string; id: string };
    'comment.edited': { projectId: string; comment: Comment };

    // Reviews (for WebSocket broadcast and notifications)
    'review.submitted': { projectId: string; review: Review };
    'review.approved': { projectId: string; review: Review };
    'review.rejected': { projectId: string; review: Review };
    'review.entryStatusChanged': {
        projectId: string;
        entryId: string;
        modelId: string;
        status: EntryStatus;
    };
    'review.pageStatusChanged': {
        projectId: string;
        pageId: string;
        templateId: string;
        status: EntryStatus;
    };

    // Assets
    'asset:processing': { id: string; projectId: string };
    'asset:uploaded': { asset: Asset };
    'asset:ready': { asset: Asset };
    'asset:error': { id: string; projectId: string; error: string };
    'asset:updated': { asset: Asset };
    'asset:deleted': { id: string };
}

// Listener type
type EventCallback<T> = (context: T) => Promise<void>;

// Internal event listener registry
const listeners: {
    [K in keyof EventMap]?: EventCallback<EventMap[K]>[];
} = {};

// Register an event listener
export function onEvent<K extends keyof EventMap>(
    eventName: K,
    callback: EventCallback<EventMap[K]>
) {
    if (!listeners[eventName]) {
        listeners[eventName] = [];
    }
    listeners[eventName]!.push(callback);
}

// Trigger an event with context
export async function triggerEvent<K extends keyof EventMap>(eventName: K, context: EventMap[K]) {
    const cbs = listeners[eventName] || [];
    for (const cb of cbs) {
        await cb(context);
    }
}
