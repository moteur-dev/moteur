import { Router } from 'express';
import getAll from './getAll';
import getModelById from './getOne';

const router = Router({ mergeParams: true });

router.get('/', getAll);
router.get('/:modelId', getModelById);

export default router;
