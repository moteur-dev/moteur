import { Router } from 'express';
import { requireProjectAccess } from '../../middlewares/auth.js';
import { createWriteHandler } from './handler.js';

const router: Router = Router({ mergeParams: true });
router.post('/', requireProjectAccess, createWriteHandler('rewrite'));
export default router;
