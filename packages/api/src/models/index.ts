import { Router } from 'express';
import getAll, { openapi as getAllSpec } from './getAll';
import getModelById, { openapi as getOneSpec } from './getOne';
import create, { openapi as createSpec, schemas as createSchemas } from './create';
import update, { openapi as updateSpec } from './update';
import remove, { openapi as deleteSpec } from './delete';

const router: Router = Router({ mergeParams: true });

router.use(getAll);
router.use(getModelById);
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
    schemas: {
        ...createSchemas
    }
};

export default router;
