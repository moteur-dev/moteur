import { Router } from 'express';
import draftRouter from './draft.js';
import rewriteRouter from './rewrite.js';
import shortenRouter from './shorten.js';
import expandRouter from './expand.js';
import toneRouter from './tone.js';
import summariseExcerptRouter from './summarise-excerpt.js';

const router: Router = Router();
router.use('/draft', draftRouter);
router.use('/rewrite', rewriteRouter);
router.use('/shorten', shortenRouter);
router.use('/expand', expandRouter);
router.use('/tone', toneRouter);
router.use('/summarise-excerpt', summariseExcerptRouter);

export default router;
