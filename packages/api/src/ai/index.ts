import { Router } from 'express';
import generateFields, { openapi as generateFieldsSpec } from './generateFields.js';
import generateEntry, { openapi as generateEntrySpec } from './generateEntry.js';
import generateImage from './generateImage.js';
import { mergePathSpecs } from '../utils/mergePathSpecs.js';

const router: Router = Router();

router.use(generateEntry);
router.use(generateFields);
router.use(generateImage);

export const aiSpecs = {
    paths: mergePathSpecs(generateEntrySpec, generateFieldsSpec)
};

export default router;
