/**
 * Storage key convention for project-scoped data.
 * All keys are relative to the project root (adapter baseDir = project dir).
 */
export const PROJECT_KEY = 'project.json';

export const ASSETS_KEY = 'assets.json';

export const API_COLLECTIONS_KEY = 'api-collections.json';

export const ACTIVITY_KEY = 'activity.json';

export const COMMENTS_KEY = 'comments.json';

export const REVIEWS_KEY = 'reviews.json';

export const NOTIFICATIONS_KEY = 'notifications.json';

export function modelKey(modelId: string): string {
    return `models/${modelId}/model.json`;
}

export function modelListPrefix(): string {
    return 'models/';
}

export function entryKey(modelId: string, entryId: string): string {
    return `models/${modelId}/entries/${entryId}/entry.json`;
}

export function entryListPrefix(modelId: string): string {
    return `models/${modelId}/entries/`;
}

export function layoutKey(layoutId: string): string {
    return `layouts/${layoutId}/layout.json`;
}

export function layoutListPrefix(): string {
    return 'layouts/';
}

export function structureKey(structureId: string): string {
    return `structures/${structureId}/structure.json`;
}

export function structureListPrefix(): string {
    return 'structures/';
}

export function templateKey(templateId: string): string {
    return `templates/${templateId}.json`;
}

export function templateListPrefix(): string {
    return 'templates/';
}

export function pageKey(pageId: string): string {
    return `pages/${pageId}.json`;
}

export function pageListPrefix(): string {
    return 'pages/';
}

export const NAVIGATIONS_KEY = 'navigations.json';

export const WEBHOOKS_KEY = 'webhooks.json';
export const WEBHOOK_LOG_KEY = 'webhook-log.json';

export function formKey(formId: string): string {
    return `forms/${formId}/form.json`;
}

export function formListPrefix(): string {
    return 'forms/';
}

export function submissionKey(formId: string, submissionId: string): string {
    return `forms/${formId}/submissions/${submissionId}/submission.json`;
}

export function submissionListPrefix(formId: string): string {
    return `forms/${formId}/submissions/`;
}
