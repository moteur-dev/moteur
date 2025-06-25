import * as Projects from './projects';
import * as Layouts from './layouts';
import * as Structures from './structures';
import * as Blocks from './blocks';

import type { MoteurAPI } from './MoteurAPI';

// Ensure core plugins are loaded
import './plugins/core/autoAssignUser';
import './plugins/core/auditLogger';
import './plugins/core/autoAssignUser';
import './plugins/core/validation';

import './fields';

export const Moteur: MoteurAPI = {
    projects: Projects,
    layouts: Layouts,
    structures: Structures,

    blocks: Blocks
};

export default Moteur;
