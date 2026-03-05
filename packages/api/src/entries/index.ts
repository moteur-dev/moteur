import { Router } from 'express';

import { mergePathSpecs } from '../utils/mergePathSpecs.js';

import getAll, { openapi as getAllSpec } from './getAll.js';
import getOne, { openapi as getOneSpec } from './getOne.js';
import create, { openapi as createSpec } from './create.js';
import update, { openapi as updateSpec } from './update.js';
import remove, { openapi as deleteSpec } from './delete.js';
import submitReview, { openapi as submitReviewSpec } from './submitReview.js';
import status, { openapi as statusSpec } from './status.js';

const router: Router = Router({ mergeParams: true });

router.use(getAll);
router.use(getOne);
router.use(create);
router.use(update);
router.use(remove);
router.use(submitReview);
router.use(status);

export const entriesSpecs = {
    paths: mergePathSpecs(getAllSpec, getOneSpec, createSpec, updateSpec, deleteSpec, submitReviewSpec, statusSpec),
    schemas: {}
};

export default router;
