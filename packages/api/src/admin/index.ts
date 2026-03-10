import { Router } from 'express';
import { mergePathSpecs } from '../utils/mergePathSpecs.js';
import adminTemplatesRouter, { openapi as adminTemplatesSpec } from './templates/index.js';
import adminPagesRouter, { openapi as adminPagesSpec } from './pages/index.js';
import adminStructuresRouter from './structures/index.js';
import adminLayoutsRouter from './layouts/index.js';
import adminCollectionsRouter, { openapi as adminCollectionsSpec } from './collections/index.js';
import adminApiKeyRouter, { openapi as adminApiKeySpec } from './apiKey/index.js';
import adminAssetsRouter from './assets/index.js';
import adminAssetConfigRouter from './assetConfig.js';
import adminNavigationsRouter from './navigations/index.js';
import adminWebhooksRouter from './webhooks/index.js';
import adminFormsRouter, { openapi as adminFormsSpec } from './forms/index.js';
import adminBlocksRouter from './blocks.js';

const router: Router = Router({ mergeParams: true });

router.use('/:projectId/templates', adminTemplatesRouter);
router.use('/:projectId/pages', adminPagesRouter);
router.use('/:projectId/structures', adminStructuresRouter);
router.use('/:projectId/layouts', adminLayoutsRouter);
router.use('/:projectId/collections', adminCollectionsRouter);
router.use('/:projectId/api-key', adminApiKeyRouter);
router.use('/:projectId/assets', adminAssetsRouter);
router.use('/:projectId/asset-config', adminAssetConfigRouter);
router.use('/:projectId/navigations', adminNavigationsRouter);
router.use('/:projectId/webhooks', adminWebhooksRouter);
router.use('/:projectId/forms', adminFormsRouter);
router.use('/:projectId/blocks', adminBlocksRouter);

export const adminSpecs = {
    paths: mergePathSpecs(
        adminTemplatesSpec,
        adminPagesSpec,
        adminCollectionsSpec,
        adminApiKeySpec,
        adminFormsSpec
    )
};

export default router;
