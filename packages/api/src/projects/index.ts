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
import reviewsRouter, { openapi as reviewsSpec } from './reviews/index.js';
import notificationsRouter, { openapi as notificationsSpec } from './notifications/index.js';
import publicTemplatesRouter, { openapi as publicTemplatesSpec } from './templates/public.js';
import publicPagesRouter, { openapi as publicPagesSpec } from './pages/public.js';
import collectionsPublicRouter, { openapi as collectionsPublicSpec } from './collections/public.js';
import { optionalAuth, apiKeyAuth, requireCollectionAuth } from '../middlewares/auth.js';

const router: Router = Router();

router.use(getAll);
router.use(getOne);
router.use(create);
router.use(update);
router.use(remove);
router.use(users);
router.use(presenceFormState);
router.use(debug);
router.use('/:projectId/templates', publicTemplatesRouter);
router.use('/:projectId/pages', publicPagesRouter);
router.use(
    '/:projectId/collections',
    optionalAuth,
    apiKeyAuth,
    requireCollectionAuth,
    collectionsPublicRouter
);
router.use('/:projectId/activity', activityRouter);
router.use('/:projectId/comments', commentsRouter);
router.use('/:projectId/reviews', reviewsRouter);
router.use('/:projectId/notifications', notificationsRouter);

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
        commentsSpec,
        reviewsSpec,
        notificationsSpec,
        publicTemplatesSpec,
        publicPagesSpec,
        collectionsPublicSpec
    ),
    schemas: {
        ...createSchemas,
        ...activitySchemas,
        ...commentsSchemas
    }
};

export default router;
