// utils/eventBus.ts
import { ProjectSchema } from '../types/Project';
import { ModelSchema, Entry } from '../types/Model';
import { Layout } from '../types/Layout';
import { Block } from '../types/Block';
import { StructureSchema } from '../types/Structure';
import { User } from '../types/User';

// Event context uses explicit resource keys (like { project, user }) for clarity.
export interface EventMap {
    // Projects
    'project.beforeCreate': { project: ProjectSchema; user: User };
    'project.afterCreate': { project: ProjectSchema; user: User };
    'project.beforeUpdate': { project: ProjectSchema; user: User };
    'project.afterUpdate': { project: ProjectSchema; user: User };
    'project.beforeDelete': { project: ProjectSchema; user: User };
    'project.afterDelete': { project: ProjectSchema; user: User };

    // Models
    'model.beforeCreate': { model: ModelSchema; user: User };
    'model.afterCreate': { model: ModelSchema; user: User };
    'model.beforeUpdate': { model: ModelSchema; user: User };
    'model.afterUpdate': { model: ModelSchema; user: User };
    'model.beforeDelete': { model: ModelSchema; user: User };
    'model.afterDelete': { model: ModelSchema; user: User };

    // Entries
    'entry.beforeCreate': { entry: Entry; user: User };
    'entry.afterCreate': { entry: Entry; user: User };
    'entry.beforeUpdate': { entry: Entry; user: User };
    'entry.afterUpdate': { entry: Entry; user: User };
    'entry.beforeDelete': { entry: Entry; user: User };
    'entry.afterDelete': { entry: Entry; user: User };

    // Layouts
    'layout.beforeCreate': { layout: Layout; user: User };
    'layout.afterCreate': { layout: Layout; user: User };
    'layout.beforeUpdate': { layout: Layout; user: User };
    'layout.afterUpdate': { layout: Layout; user: User };
    'layout.beforeDelete': { layout: Layout; user: User };
    'layout.afterDelete': { layout: Layout; user: User };

    // Blocks
    'block.created': { block: Block; user: User };

    // Structures
    'structure.beforeCreate': { structure: StructureSchema; user: User };
    'structure.afterCreate': { structure: StructureSchema; user: User };
    'structure.beforeUpdate': { structure: StructureSchema; user: User };
    'structure.afterUpdate': { structure: StructureSchema; user: User };
    'structure.beforeDelete': { structure: StructureSchema; user: User };
    'structure.afterDelete': { structure: StructureSchema; user: User };

    // Users
    'user.beforeCreate': { user: User };
    'user.afterCreate': { user: User };
    'user.beforeUpdate': { user: User };
    'user.afterUpdate': { user: User };
    'user.beforeDelete': { user: User };
    'user.afterDelete': { user: User };
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
