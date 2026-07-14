import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { SupplierLead } from '../models/SupplierLead.js';
import { sendSupplierLeadEmail } from '../services/email.service.js';

const router = Router();

const applySchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  country: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  supplierType: z.enum(['manufacturer', 'distributor', 'both', 'other']).default('distributor'),
  categories: z.array(z.string()).min(1),
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .min(1),
  documentsReady: z.array(z.string()).default([]),
  message: z.string().optional(),
});

router.post(
  '/apply',
  asyncHandler(async (req, res) => {
    const body = applySchema.parse(req.body);

    const lead = await SupplierLead.create({
      ...body,
      email: body.email.toLowerCase(),
      status: 'new',
    });

    await sendSupplierLeadEmail(lead).catch((err) => {
      console.warn('[suppliers] lead email failed:', err.message);
    });

    res.status(201).json({
      success: true,
      id: lead._id.toString(),
      message: 'Application received. Our team will review it shortly.',
    });
  })
);

export default router;
