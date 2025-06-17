import express, { Router} from 'express'
import {generateJWT } from '@/api/auth'
import { requireAuth } from '@/middlewares/auth'

const router: Router = express.Router()

router.post('/refresh', requireAuth, async (req: any, res: any) => {

  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return res.json({ token:  generateJWT(user) })
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
})

export default router
