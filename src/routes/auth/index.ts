import { Router } from 'express';

import login from './login';
import refresh from './refresh';
import me from './me';

const router = Router();

router.use(login);
router.use(refresh);
router.use(me);

export default router;
