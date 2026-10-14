import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { requireAdminKey, getAdminSecret } from '../middlewares/auth.middleware.js';
import { SupplierLead } from '../models/SupplierLead.js';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { password } = z.object({ password: z.string().min(1) }).parse(req.body);
    const expected = getAdminSecret();
    if (!expected) {
      return res.status(503).json({
        error: 'Admin is not configured. Set ADMIN_KEY on the backend.',
      });
    }
    if (password !== expected) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }
    res.json({ success: true });
  })
);

router.get(
  '/me',
  requireAdminKey,
  asyncHandler(async (_req, res) => {
    res.json({ configured: true, authenticated: true });
  })
);

router.get(
  '/stats',
  requireAdminKey,
  asyncHandler(async (_req, res) => {
    const [total, newCount, reviewing, accepted, rejected] = await Promise.all([
      SupplierLead.countDocuments(),
      SupplierLead.countDocuments({ status: 'new' }),
      SupplierLead.countDocuments({ status: 'reviewing' }),
      SupplierLead.countDocuments({ status: 'accepted' }),
      SupplierLead.countDocuments({ status: 'rejected' }),
    ]);

    const recent = await SupplierLead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName contactName status createdAt email')
      .lean();

    res.json({
      stats: { total, new: newCount, reviewing, accepted, rejected },
      recent: recent.map((r) => ({
        id: r._id.toString(),
        companyName: r.companyName,
        contactName: r.contactName,
        email: r.email,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  })
);

export default router;
