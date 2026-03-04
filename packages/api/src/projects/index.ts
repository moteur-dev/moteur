import { Router } from 'express';

import { mergePathSpecs } from '../utils/mergePathSpecs.js';

import getAll, { openapi as getAllSpec } from './getAll.js';
import getOne, { openapi as getOneSpec } from './getOne.js';
import create, { openapi as createSpec, schemas as createSchemas } from './create.js';
import update, { openapi as updateSpec } from './update.js';
import remove, { openapi as deleteSpec } from './delete.js';
import users, { openapi as usersSpec } from './users.js';
import blueprintsRouter, {
    openapi as blueprintsSpec,
    schemas as blueprintsSchemas
} from './blueprints/index.js';

import presenceFormState, { openapi as presenceFormStateSpec } from './presence/formState.js';
import debug, { openapi as debugSpec } from './presence/debug.js';

const router: Router = Router();

router.use(getAll);
router.use('/blueprints', blueprintsRouter);
router.use(getOne);
router.use(create);
router.use(update);
router.use(remove);
router.use(users);
router.use(presenceFormState);
router.use(debug);

export const projectsSpecs = {
    paths: mergePathSpecs(
        getAllSpec,
        getOneSpec,
        createSpec,
        updateSpec,
        deleteSpec,
        usersSpec,
        blueprintsSpec,
        presenceFormStateSpec,
        debugSpec
    ),
    schemas: {
        ...createSchemas,
        ...blueprintsSchemas
    }
};

export default router;
