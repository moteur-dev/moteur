import * as Projects from './api/projects.js';
import * as Layouts from './api/layouts.js';
import * as Structures from './api/structures.js';
import * as Fields from './api/fields.js';
import * as Blocks from './api/blocks.js';

import type { MoteurAPI } from './types/MoteurAPI.js';

export const Moteur: MoteurAPI = {
    projects: Projects,
    layouts: Layouts,
    structures: Structures,
    fields: Fields,
    blocks: Blocks
};

export default Moteur;
