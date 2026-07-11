import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/error.middleware.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  sanitizeUser,
  requestPasswordReset,
  resetPasswordWithToken,
} from '../services/auth.service.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const user = await registerUser(res, body);
    res.json({ success: true, user });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await loginUser(res, body.email, body.password, {
      ipAddress: req.ip,
    });
    res.json({ success: true, user });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    await logoutUser(req, res);
    res.json({ success: true });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ user: sanitizeUser(user) });
  })
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await requestPasswordReset(email);
    res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  })
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        token: z.string().min(1),
        password: z.string().min(6),
      })
      .parse(req.body);
    await resetPasswordWithToken(body.token, body.password);
    res.json({ success: true });
  })
);

export default router;
