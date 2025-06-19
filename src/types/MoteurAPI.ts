import type * as Projects from '../api/projects';
import type * as Layouts from '../api/layouts';
import type * as Structures from '../api/structures';
//import type * as Fields from '../api/fields';
import type * as Blocks from '../api/blocks';

export interface MoteurAPI {
    projects: typeof Projects;
    layouts: typeof Layouts;
    structures: typeof Structures;
    //fields: typeof Fields;
    blocks: typeof Blocks;
}
