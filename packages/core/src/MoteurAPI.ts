import type * as Projects from './projects';
import type * as Layouts from './layouts';
import type * as Structures from './structures';
import type * as Activity from './activityLogger';
//import type * as Fields from '../api/fields';
import type * as Blocks from './blocks';
import type * as Comments from './comments';

export interface MoteurAPI {
    projects: typeof Projects;
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
}
