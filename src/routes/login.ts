import { Request, Response } from 'express';
import express from 'express';
import { loginUser, generateJWT } from '../api/auth.js';

const router = express.Router();

router.post('/login', (req: any, res: any) => {
    const { username, password } = req.body;
    const user = loginUser(username, password);

    return res.json(user);
});

export default router;
