import { Router } from 'express';
import { requireProjectAccess } from '../../middlewares/auth.js';
import { createWriteHandler } from './handler.js';

const router: Router = Router({ mergeParams: true });
router.post('/formal', requireProjectAccess, createWriteHandler('tone:formal'));
router.post('/conversational', requireProjectAccess, createWriteHandler('tone:conversational'));
router.post('/editorial', requireProjectAccess, createWriteHandler('tone:editorial'));
export default router;
