import type { EntryStatus } from './Model.js';

export type ApiCollectionResource = {
    resourceType: 'model' | 'page';
    resourceId: string; // modelId, or 'pages' for all pages, or a specific templateId for pages
    fields?: string[]; // list of field names to include; null/empty = all fields
    filters?: {
        status?: EntryStatus | EntryStatus[];
        locale?: string;
    };
    resolve?: 0 | 1 | 2; // reference resolution depth; default: 0
};

export interface ApiCollection {
    id: string;
    projectId: string;
    label: string;
    description?: string;
    resources: ApiCollectionResource[];
    createdAt: string;
    updatedAt: string;
}
