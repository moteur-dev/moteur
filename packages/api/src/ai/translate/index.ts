import { Router } from 'express';
import fieldRouter from './field.js';
import entryRouter from './entry.js';

const router: Router = Router();
router.use('/field', fieldRouter);
router.use('/entry', entryRouter);

export default router;
