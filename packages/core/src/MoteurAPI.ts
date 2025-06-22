import type * as Projects from './projects';
import type * as Layouts from './layouts';
import type * as Structures from './structures';
//import type * as Fields from '../api/fields';
import type * as Blocks from './blocks';

export interface MoteurAPI {
    projects: typeof Projects;
    layouts: typeof Layouts;
    structures: typeof Structures;
    //fields: typeof Fields;
    blocks: typeof Blocks;
}
