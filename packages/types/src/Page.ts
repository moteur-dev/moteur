import type { EntryStatus } from './Model.js';

export interface Page {
    id: string;
    projectId: string;
    templateId: string;
    label: string;
    slug?: string;
    parentId?: string;
    status: EntryStatus;
    fields: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
