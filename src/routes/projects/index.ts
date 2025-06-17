import { Router } from 'express';

import getAll from './getAll';
import getOne from './getOne';
import create from './create';
//import update from './update'
//import remove from './delete'

const router = Router();

router.use(getAll);
router.use(getOne);
router.use(create);
//router.use(update)
//router.use(remove)

export default router;
