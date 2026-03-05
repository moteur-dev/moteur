import { randomUUID } from 'crypto';
import type { Review, GetReviewsOptions } from '@moteur/types/Review.js';
import type { User } from '@moteur/types/User.js';
import { getProject } from './projects.js';
import { addComment } from './comments.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson } from './utils/storageAdapterUtils.js';
import { REVIEWS_KEY, entryKey } from './utils/storageKeys.js';
import { getModelSchema } from './models.js';
import type { Entry } from '@moteur/types/Model.js';
import { log, toActivityEvent } from './activityLogger.js';
import { triggerEvent } from './utils/eventBus.js';
import { createNotification } from './notifications.js';
import { sendReviewEmail } from './emailNotifier.js';
import { getProjectUsers, getUserById } from './users.js';

function normalizeUserName(user: User): string {
    return user?.name ?? user?.id ?? 'Unknown';
}

function assertReviewerOrAdmin(user: User): void {
    const isAdmin = Array.isArray(user.roles) && user.roles.includes('admin');
    const isReviewer = Array.isArray(user.roles) && user.roles.includes('reviewer');
    if (!isAdmin && !isReviewer) {
        throw new Error('Only users with reviewer or admin role can perform this action');
    }
}

/**
 * Submit an entry for review. Sets entry status to 'in_review' and creates a Review record.
 */
export async function submitForReview(
    projectId: string,
    user: User,
    modelId: string,
    entryId: string,
    assignedTo?: string
): Promise<Review> {
    const project = await getProject(user, projectId);
    if (!project.workflow?.enabled) {
        throw new Error('Review workflow is not enabled for this project');
    }

    await getModelSchema(user, projectId, modelId);
    const storage = getProjectStorage(projectId);
    const entry = await getJson<Entry>(storage, entryKey(modelId, entryId));
    if (!entry) {
        throw new Error(
            `Entry "${entryId}" not found in model "${modelId}" of project "${projectId}".`
        );
    }
    const now = new Date().toISOString();

    try {
        const list = (await getJson<Review[]>(storage, REVIEWS_KEY)) ?? [];

        const pendingForEntry = list.some(
            r => r.modelId === modelId && r.entryId === entryId && r.status === 'pending'
        );
        if (pendingForEntry) {
            throw new Error('This entry already has a pending review');
        }

        const requestedByName = normalizeUserName(user);
        const review: Review = {
            id: randomUUID(),
            projectId,
            modelId,
            entryId,
            status: 'pending',
            requestedBy: user.id,
            requestedByName,
            ...(assignedTo && { assignedTo }),
            createdAt: now
        };
        list.push(review);
        await putJson(storage, REVIEWS_KEY, list);

        const entryUpdated: Entry = { ...entry, status: 'in_review' };
        await putJson(storage, entryKey(modelId, entryId), entryUpdated);

        log(
            toActivityEvent(
                projectId,
                'entry',
                `${modelId}__${entryId}`,
                'submitted_for_review',
                user
            )
        );

        try {
            await triggerEvent('review.submitted', { projectId, review });
        } catch {
            // never break on emit failure
        }
        try {
            await triggerEvent('review.entryStatusChanged', {
                projectId,
                entryId,
                modelId,
                status: 'in_review'
            });
        } catch {
            // never break on emit failure
        }

        const recipients: string[] = assignedTo
            ? [assignedTo]
            : getProjectUsers(projectId)
                  .filter(u => u.roles?.includes('reviewer') || u.roles?.includes('admin'))
                  .map(u => u.id);
        for (const recipientId of recipients) {
            try {
                await createNotification(projectId, recipientId, {
                    type: 'review_requested',
                    reviewId: review.id,
                    entryId,
                    modelId
                });
            } catch {
                // swallow per-recipient failure
            }
        }

        try {
            for (const recipientId of recipients) {
                const recipient = getProjectUsers(projectId).find(u => u.id === recipientId);
                if (recipient?.email) {
                    sendReviewEmail('review_requested', recipient, review, project).catch(() => {});
                }
            }
        } catch {
            // non-blocking, fail silently
        }

        return review;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to submit for review');
    }
}

/**
 * Approve a review. Only users with 'reviewer' or 'admin' role. Sets entry to published (auto_publish mode).
 */
export async function approveReview(
    projectId: string,
    user: User,
    reviewId: string
): Promise<Review> {
    assertReviewerOrAdmin(user);
    const project = await getProject(user, projectId);
    if (!project.workflow?.enabled) {
        throw new Error('Review workflow is not enabled for this project');
    }

    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Review[]>(storage, REVIEWS_KEY)) ?? [];
        const idx = list.findIndex(r => r.id === reviewId && r.projectId === projectId);
        if (idx === -1) throw new Error('Review not found');
        const review = list[idx]!;
        if (review.status !== 'pending') {
            throw new Error('Review is not pending');
        }

        const now = new Date().toISOString();
        const reviewedByName = normalizeUserName(user);
        const updated: Review = {
            ...review,
            status: 'approved',
            reviewedBy: user.id,
            reviewedByName,
            resolvedAt: now
        };
        list[idx] = updated;
        await putJson(storage, REVIEWS_KEY, list);

        const entry = await getJson<Entry>(storage, entryKey(review.modelId, review.entryId));
        if (entry) {
            await putJson(storage, entryKey(review.modelId, review.entryId), {
                ...entry,
                status: 'published'
            });
        }

        log(
            toActivityEvent(
                projectId,
                'entry',
                `${review.modelId}__${review.entryId}`,
                'approved',
                user
            )
        );

        try {
            await triggerEvent('review.approved', { projectId, review: updated });
        } catch {
            // never break on emit failure
        }
        try {
            await triggerEvent('review.entryStatusChanged', {
                projectId,
                entryId: review.entryId,
                modelId: review.modelId,
                status: 'published'
            });
        } catch {
            // never break on emit failure
        }

        try {
            await createNotification(projectId, review.requestedBy, {
                type: 'approved',
                reviewId: updated.id,
                entryId: review.entryId,
                modelId: review.modelId
            });
        } catch {
            // swallow
        }

        try {
            const requestedByUser = getUserById(review.requestedBy);
            if (requestedByUser?.email) {
                sendReviewEmail('approved', requestedByUser, updated, project).catch(() => {});
            }
        } catch {
            // non-blocking
        }

        return updated;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to approve review');
    }
}

/**
 * Reject a review. Only users with 'reviewer' or 'admin' role. Creates a Comment with the reason, sets entry back to draft.
 */
export async function rejectReview(
    projectId: string,
    user: User,
    reviewId: string,
    commentBody: string
): Promise<Review> {
    assertReviewerOrAdmin(user);
    const project = await getProject(user, projectId);
    if (!project.workflow?.enabled) {
        throw new Error('Review workflow is not enabled for this project');
    }

    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Review[]>(storage, REVIEWS_KEY)) ?? [];
        const idx = list.findIndex(r => r.id === reviewId && r.projectId === projectId);
        if (idx === -1) throw new Error('Review not found');
        const review = list[idx]!;
        if (review.status !== 'pending') {
            throw new Error('Review is not pending');
        }

        const resourceId = `${review.modelId}__${review.entryId}`;
        const comment = await addComment(projectId, user, {
            resourceType: 'entry',
            resourceId,
            body: commentBody.trim() || 'Rejected without comment.'
        });

        const now = new Date().toISOString();
        const reviewedByName = normalizeUserName(user);
        const updated: Review = {
            ...review,
            status: 'rejected',
            reviewedBy: user.id,
            reviewedByName,
            rejectionCommentId: comment.id,
            resolvedAt: now
        };
        list[idx] = updated;
        await putJson(storage, REVIEWS_KEY, list);

        const entry = await getJson<Entry>(storage, entryKey(review.modelId, review.entryId));
        if (entry) {
            await putJson(storage, entryKey(review.modelId, review.entryId), {
                ...entry,
                status: 'draft'
            });
        }

        log(toActivityEvent(projectId, 'entry', resourceId, 'rejected', user));

        try {
            await triggerEvent('review.rejected', { projectId, review: updated });
        } catch {
            // never break on emit failure
        }
        try {
            await triggerEvent('review.entryStatusChanged', {
                projectId,
                entryId: review.entryId,
                modelId: review.modelId,
                status: 'draft'
            });
        } catch {
            // never break on emit failure
        }

        try {
            await createNotification(projectId, review.requestedBy, {
                type: 'rejected',
                reviewId: updated.id,
                entryId: review.entryId,
                modelId: review.modelId
            });
        } catch {
            // swallow
        }

        try {
            const requestedByUser = getUserById(review.requestedBy);
            if (requestedByUser?.email) {
                sendReviewEmail('rejected', requestedByUser, updated, project).catch(() => {});
            }
        } catch {
            // non-blocking
        }

        return updated;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to reject review');
    }
}

export async function getReviews(
    projectId: string,
    options?: GetReviewsOptions
): Promise<Review[]> {
    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Review[]>(storage, REVIEWS_KEY)) ?? [];
        let out = list.filter(r => r.projectId === projectId);
        if (options?.modelId) out = out.filter(r => r.modelId === options.modelId);
        if (options?.entryId) out = out.filter(r => r.entryId === options.entryId);
        if (options?.status) out = out.filter(r => r.status === options.status);
        out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return out;
    } catch {
        return [];
    }
}

export async function getReview(projectId: string, reviewId: string): Promise<Review | null> {
    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Review[]>(storage, REVIEWS_KEY)) ?? [];
        const review = list.find(r => r.id === reviewId && r.projectId === projectId);
        return review ?? null;
    } catch {
        return null;
    }
}

/**
 * Returns true if the entry has at least one approved review (used by publish guard).
 */
export async function hasApprovedReview(
    projectId: string,
    modelId: string,
    entryId: string
): Promise<boolean> {
    const reviews = await getReviews(projectId, { modelId, entryId, status: 'approved' });
    return reviews.length > 0;
}
