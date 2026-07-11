import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { requireAuth, sanitizeUser } from '../middlewares/auth.middleware.js';
import { updateProfile } from '../services/auth.service.js';

const router = Router();

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
});

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: sanitizeUser(req.user) });
  })
);

router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = updateSchema.parse(req.body);
    const user = await updateProfile(req.user._id.toString(), body);
    res.json({ user });
  })
);

export default router;
