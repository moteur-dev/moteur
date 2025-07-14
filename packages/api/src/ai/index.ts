import { Router } from 'express';
import generateFields, { openapi as generateFieldsSpec } from './generateFields';
import generateEntry, { openapi as generateEntrySpec } from './generateEntry';
import generateImage from './generateImage';
import { mergePathSpecs } from '../utils/mergePathSpecs';

const router: Router = Router();

router.use(generateEntry);
router.use(generateFields);
router.use(generateImage);

export const aiSpecs = {
    paths: mergePathSpecs(generateEntrySpec, generateFieldsSpec)
};

export default router;
