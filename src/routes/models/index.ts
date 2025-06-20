import { Router } from 'express';
import getAll, { openapi as getAllSpec } from './getAll';
import getModelById, { openapi as getOneSpec } from './getOne';
import create, { openapi as createSpec, schemas as createSchemas } from './create';

const router = Router({ mergeParams: true });

router.use('/', getAll);
router.use('/:modelId', getModelById);
router.use('/', create);

export const modelsSpecs = {
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
