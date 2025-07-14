import * as Projects from './projects.js';
import * as Layouts from './layouts.js';
import * as Structures from './structures.js';
import * as Blocks from './blocks.js';

import type { MoteurAPI } from './MoteurAPI.js';

// Ensure core plugins are loaded
import './plugins/core/autoAssignUser.js';
import './plugins/core/auditLogger.js';
import './plugins/core/autoAssignUser.js';
import './plugins/core/validation.js';

import './fields/index.js';

export const Moteur: MoteurAPI = {
    projects: Projects,
    layouts: Layouts,
    structures: Structures,

    blocks: Blocks
};

export default Moteur;
