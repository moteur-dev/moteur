import { Router } from 'express';
import { mergePathSpecs } from '../utils/mergePathSpecs.js';
import adminTemplatesRouter, { openapi as adminTemplatesSpec } from './templates/index.js';
import adminPagesRouter, { openapi as adminPagesSpec } from './pages/index.js';
import adminStructuresRouter from './structures/index.js';
import adminLayoutsRouter from './layouts/index.js';
import adminCollectionsRouter, { openapi as adminCollectionsSpec } from './collections/index.js';
import adminApiKeyRouter, { openapi as adminApiKeySpec } from './apiKey/index.js';

const router: Router = Router({ mergeParams: true });

router.use('/:projectId/templates', adminTemplatesRouter);
router.use('/:projectId/pages', adminPagesRouter);
router.use('/:projectId/structures', adminStructuresRouter);
router.use('/:projectId/layouts', adminLayoutsRouter);
router.use('/:projectId/collections', adminCollectionsRouter);
router.use('/:projectId/api-key', adminApiKeyRouter);

export const adminSpecs = {
    paths: mergePathSpecs(adminTemplatesSpec, adminPagesSpec, adminCollectionsSpec, adminApiKeySpec)
};

export default router;
