import * as Projects from './projects.js';
import * as Templates from './templates.js';
import * as Pages from './pages.js';
import * as Layouts from './layouts.js';
import * as Structures from './structures.js';
import * as ActivityLogger from './activityLogger.js';
import * as Blocks from './blocks.js';
import * as Comments from './comments.js';
import * as Reviews from './reviews.js';
import * as Notifications from './notifications.js';
import * as ApiCollections from './apiCollections.js';
import * as ProjectApiKey from './projectApiKey.js';
import * as Assets from './assets/assetService.js';

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
import './assets/index.js';

export const Moteur: MoteurAPI = {
    projects: Projects,
    templates: Templates,
    pages: Pages,
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
        submitPage: Reviews.submitForPageReview,
        approve: Reviews.approveReview,
        reject: Reviews.rejectReview,
        get: Reviews.getReviews,
        getOne: Reviews.getReview
    },
    notifications: {
        get: Notifications.getNotifications,
        markRead: Notifications.markRead,
        markAllRead: Notifications.markAllRead
    },
    collections: {
        list: ApiCollections.listCollections,
        get: ApiCollections.getCollection,
        create: ApiCollections.createCollection,
        update: ApiCollections.updateCollection,
        delete: ApiCollections.deleteCollection
    },
    projectApiKey: {
        generate: ProjectApiKey.generateKey,
        rotate: ProjectApiKey.rotateKey,
        revoke: ProjectApiKey.revokeKey
    },
    assets: {
        upload: Assets.uploadAsset,
        list: Assets.listAssets,
        get: Assets.getAsset,
        update: Assets.updateAsset,
        delete: Assets.deleteAsset,
        move: Assets.moveToFolder,
        regenerate: Assets.regenerateVariants,
        migrateProvider: Assets.migrateProvider,
        getConfig: Assets.getAssetConfig,
        updateConfig: Assets.updateAssetConfig
    }
};

export default Moteur;
