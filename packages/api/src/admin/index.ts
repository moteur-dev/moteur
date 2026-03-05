import { Router } from 'express';
import { mergePathSpecs } from '../utils/mergePathSpecs.js';
import adminTemplatesRouter, { openapi as adminTemplatesSpec } from './templates/index.js';
import adminPagesRouter, { openapi as adminPagesSpec } from './pages/index.js';

const router: Router = Router({ mergeParams: true });

router.use('/:projectId/templates', adminTemplatesRouter);
router.use('/:projectId/pages', adminPagesRouter);

export const adminSpecs = {
    paths: mergePathSpecs(adminTemplatesSpec, adminPagesSpec)
};

export default router;
