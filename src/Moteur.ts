import * as Projects from './api/projects.js';
import * as Layouts from './api/layouts.js';
import * as Structures from './api/structures.js';
import * as Blocks from './api/blocks.js';

import type { MoteurAPI } from '@/types/MoteurAPI.js';

import '@/plugins/core/autoAssignUser.js';
import '@/plugins/core/auditLogger.js';
import '@/plugins/core/autoAssignUser.js';
import '@/plugins/core/validation.js';

import '@/fields';

export const Moteur: MoteurAPI = {
    projects: Projects,
    layouts: Layouts,
    structures: Structures,

    blocks: Blocks
};

export default Moteur;
