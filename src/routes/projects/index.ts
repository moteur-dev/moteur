import { Router } from 'express';

import getAll, { openapi as getAllSpec } from './getAll';
import getOne, { openapi as getOneSpec } from './getOne';
import create, { openapi as createSpec, schemas as createSchemas, schemas } from './create';
//import update from './update'
//import remove from './delete'

const router = Router();

router.use(getAll);
router.use(getOne);
router.use(create);
//router.use(update)
//router.use(remove)

export const projectsSpecs = {
    paths: {
        ...getAllSpec,
        ...getOneSpec,
        ...createSpec
    },
    schemas: {
        ...createSchemas
    }
};

export default router;
