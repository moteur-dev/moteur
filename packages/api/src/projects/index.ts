import { Router } from 'express';

import { mergePathSpecs } from '../utils/mergePathSpecs.js';

import getAll, { openapi as getAllSpec } from './getAll.js';
import getOne, { openapi as getOneSpec } from './getOne.js';
import create, { openapi as createSpec, schemas as createSchemas } from './create.js';
import update, { openapi as updateSpec } from './update.js';
import remove, { openapi as deleteSpec } from './delete.js';
import users, { openapi as usersSpec } from './users.js';

import presenceFormState, { openapi as presenceFormStateSpec } from './presence/formState.js';
import debug, { openapi as debugSpec } from './presence/debug.js';
import activityRouter, {
    openapi as activitySpec,
    schemas as activitySchemas
} from './activity/index.js';
import commentsRouter, {
    openapi as commentsSpec,
    schemas as commentsSchemas
} from './comments/index.js';

const router: Router = Router();

router.use(getAll);
router.use(getOne);
router.use(create);
router.use(update);
router.use(remove);
router.use(users);
router.use(presenceFormState);
router.use(debug);
router.use('/:projectId/activity', activityRouter);
router.use('/:projectId/comments', commentsRouter);

export const projectsSpecs = {
    paths: mergePathSpecs(
        getAllSpec,
        getOneSpec,
        createSpec,
        updateSpec,
        deleteSpec,
        usersSpec,
        presenceFormStateSpec,
        debugSpec,
        activitySpec,
        commentsSpec
    ),
    schemas: {
        ...createSchemas,
        ...activitySchemas,
        ...commentsSchemas
    }
};

export default router;
