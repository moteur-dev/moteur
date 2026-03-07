import type * as Projects from './projects';
import type * as Layouts from './layouts';
import type * as Structures from './structures';
import type * as Activity from './activityLogger';
//import type * as Fields from '../api/fields';
import type * as Blocks from './blocks';
import type * as Comments from './comments';
import type * as Reviews from './reviews';
import type * as Notifications from './notifications';
import type * as Templates from './templates';
import type * as Pages from './pages';
import type * as ApiCollections from './apiCollections';
import type * as ProjectApiKey from './projectApiKey';

export interface MoteurAPI {
    projects: typeof Projects;
    templates: typeof Templates;
    pages: typeof Pages;
    layouts: typeof Layouts;
    structures: typeof Structures;
    activity: Pick<typeof Activity, 'getLog' | 'getProjectLog' | 'getGlobalLog'>;
    blocks: typeof Blocks;
    comments: {
        add: typeof Comments.addComment;
        get: typeof Comments.getComments;
        resolve: typeof Comments.resolveComment;
        delete: typeof Comments.deleteComment;
        edit: typeof Comments.editComment;
    };
    reviews: {
        submit: typeof Reviews.submitForReview;
        submitPage: typeof Reviews.submitForPageReview;
        approve: typeof Reviews.approveReview;
        reject: typeof Reviews.rejectReview;
        get: typeof Reviews.getReviews;
        getOne: typeof Reviews.getReview;
    };
    notifications: {
        get: typeof Notifications.getNotifications;
        markRead: typeof Notifications.markRead;
        markAllRead: typeof Notifications.markAllRead;
    };
    collections: {
        list: typeof ApiCollections.listCollections;
        get: typeof ApiCollections.getCollection;
        create: typeof ApiCollections.createCollection;
        update: typeof ApiCollections.updateCollection;
        delete: typeof ApiCollections.deleteCollection;
    };
    projectApiKey: {
        generate: typeof ProjectApiKey.generateKey;
        rotate: typeof ProjectApiKey.rotateKey;
        revoke: typeof ProjectApiKey.revokeKey;
    };
}
