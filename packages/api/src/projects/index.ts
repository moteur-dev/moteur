import { Router } from 'express';

import getAll, { openapi as getAllSpec } from './getAll';
import getOne, { openapi as getOneSpec } from './getOne';
import create, { openapi as createSpec, schemas as createSchemas } from './create';
import update, { openapi as updateSpec } from './update';
import remove, { openapi as deleteSpec } from './delete';

const router: Router = Router();

router.use(getAll);
router.use(getOne);
router.use(create);
router.use(update);
router.use(remove);

export const projectsSpecs = {
    paths: {
        ...getAllSpec,
        ...getOneSpec,
        ...createSpec,
        ...updateSpec,
        ...deleteSpec
    },
    schemas: {
        ...createSchemas
    }
};

export default router;
