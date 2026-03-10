import { Router } from 'express';
import statusRouter from './status.js';
import generateRouter from './generate/index.js';
import generateImageRouter from './generateImage.js';
import saveGeneratedImageRouter from './saveGeneratedImage.js';
import translateRouter from './translate/index.js';
import writeRouter from './write/index.js';
import analyseRouter from './analyse/index.js';
import { mergePathSpecs } from '../utils/mergePathSpecs.js';
import { openapi as statusSpec } from './status.js';
import { openapi as generateSpec } from './generate/index.js';

const router: Router = Router();

router.use(statusRouter);
router.use(generateImageRouter);
router.use(saveGeneratedImageRouter);
router.use('/generate', generateRouter);
router.use('/translate', translateRouter);
router.use('/write', writeRouter);
router.use('/analyse', analyseRouter);

export const aiSpecs = {
    paths: mergePathSpecs(statusSpec, generateSpec),
};

export default router;
