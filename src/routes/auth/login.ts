import express from 'express';
import { loginUser } from '@/api/auth';

const router = express.Router();

router.post('/login', async (req: any, res: any) => {
    const { username, password } = req.body;
    const { token, user } = await loginUser(username, password);
    if (!user.id || !token) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({ token, user });
});

export default router;
