export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
    id: string;
    projectId: string;
    modelId: string;
    entryId: string;
    status: ReviewStatus;
    requestedBy: string;
    requestedByName: string;
    assignedTo?: string;
    reviewedBy?: string;
    reviewedByName?: string;
    rejectionCommentId?: string;
    createdAt: string;
    resolvedAt?: string;
}

export interface GetReviewsOptions {
    modelId?: string;
    entryId?: string;
    status?: ReviewStatus;
}
