import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { requireAuth, sanitizeUser } from '../middlewares/auth.middleware.js';
import { getDashboard } from '../services/quote.service.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const dashboard = await getDashboard(req.user._id.toString());
    res.json({ user: sanitizeUser(req.user), ...dashboard });
  })
);

export default router;
