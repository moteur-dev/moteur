import { Router } from 'express';

import getAll, { openapi as getAllSpec } from './getAll.js';
import getOne, { openapi as getOneSpec } from './getOne.js';
import create, { openapi as createSpec } from './create.js';
import update, { openapi as updateSpec } from './update.js';
import remove, { openapi as deleteSpec } from './delete.js';

const router = Router({ mergeParams: true });

router.use(getAll);
router.use(getOne);
router.use(create);
router.use(update);
router.use(remove);

export const modelsSpecs = {
    paths: {
        ...getAllSpec,
        ...getOneSpec,
        ...createSpec,
        ...updateSpec,
        ...deleteSpec
    },
    schemas: {}
};

export default router;
