import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';

const router = Router();

router.get('/me', requireAuth, (req: any, res: any) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Strip out any sensitive fields just in case
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
});

export default router;
