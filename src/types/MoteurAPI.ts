import type * as Projects from '../api/projects.js';
import type * as Layouts from '../api/layouts.js';
import type * as Structures from '../api/structures.js';
import type * as Fields from '../api/fields.js';
import type * as Blocks from '../api/blocks.js';

export interface MoteurAPI {
    projects: typeof Projects;
    layouts: typeof Layouts;
    structures: typeof Structures;
    fields: typeof Fields;
    blocks: typeof Blocks;
}
