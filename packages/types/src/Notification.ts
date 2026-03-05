export type NotificationType = 'review_requested' | 'approved' | 'rejected';

export interface Notification {
    id: string;
    projectId: string;
    userId: string;
    type: NotificationType;
    reviewId: string;
    entryId?: string;
    modelId?: string;
    pageId?: string;
    templateId?: string;
    read: boolean;
    createdAt: string;
}
