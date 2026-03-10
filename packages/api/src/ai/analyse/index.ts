import { Router } from 'express';
import imageRouter from './image.js';

const router: Router = Router();
router.use('/image', imageRouter);
export default router;
