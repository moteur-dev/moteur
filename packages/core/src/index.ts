import * as Projects from './projects.js';
import * as Layouts from './layouts.js';
import * as Structures from './structures.js';
import * as ActivityLogger from './activityLogger.js';
import * as Blocks from './blocks.js';
import * as Comments from './comments.js';
import * as Reviews from './reviews.js';
import * as Notifications from './notifications.js';

import type { MoteurAPI } from './MoteurAPI.js';

// Ensure core plugins are loaded
import './plugins/core/autoAssignUser.js';
import './plugins/core/auditLogger.js';
import './plugins/core/activityLogPlugin.js';
import './plugins/core/validation.js';

// Storage adapters (self-register on import)
import './plugins/LocalJsonStorageAdapter.js';
import './plugins/S3StorageAdapter.js';

import './fields/index.js';

export const Moteur: MoteurAPI = {
    projects: Projects,
    layouts: Layouts,
    structures: Structures,
    activity: {
        getLog: ActivityLogger.getLog,
        getProjectLog: ActivityLogger.getProjectLog,
        getGlobalLog: ActivityLogger.getGlobalLog
    },
    blocks: Blocks,
    comments: {
        add: Comments.addComment,
        get: Comments.getComments,
        resolve: Comments.resolveComment,
        delete: Comments.deleteComment,
        edit: Comments.editComment
    },
    reviews: {
        submit: Reviews.submitForReview,
        approve: Reviews.approveReview,
        reject: Reviews.rejectReview,
        get: Reviews.getReviews,
        getOne: Reviews.getReview
    },
    notifications: {
        get: Notifications.getNotifications,
        markRead: Notifications.markRead,
        markAllRead: Notifications.markAllRead
    }
};

export default Moteur;
