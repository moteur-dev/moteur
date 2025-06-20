import { Router } from 'express';
import getAll, { openapi as getAllSpec } from './getAll';
import getModelById, { openapi as getOneSpec } from './getOne';
import create, { openapi as createSpec } from './create';

const router = Router({ mergeParams: true });

router.get('/', getAll);
router.get('/:modelId', getModelById);
router.post('/', create);

export const modelsSpecs = {
    paths: {
        ...getAllSpec,
        ...getOneSpec,
        ...createSpec
    }
};

export default router;
