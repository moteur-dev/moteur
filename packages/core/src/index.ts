import * as Projects from './projects.js';
import * as Layouts from './layouts.js';
import * as Structures from './structures.js';
import * as ActivityLogger from './activityLogger.js';
import * as Blocks from './blocks.js';

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
        getProjectLog: ActivityLogger.getProjectLog
    },
    blocks: Blocks
};

export default Moteur;
