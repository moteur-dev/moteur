import { Router } from 'express';
import entryRouter from './entry.js';
import fieldsRouter from './fields.js';
import imageRouter from './image.js';
import { mergePathSpecs } from '../../utils/mergePathSpecs.js';
import { openapi as entrySpec } from './entry.js';
import { openapi as fieldsSpec } from './fields.js';

const router: Router = Router();
router.use('/entry', entryRouter);
router.use('/fields', fieldsRouter);
router.use('/image', imageRouter);

export const openapi = mergePathSpecs(entrySpec, fieldsSpec);
export default router;
