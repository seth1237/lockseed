import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { requireAdminKey } from '../middlewares/auth.middleware.js';
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

function serializeLead(lead) {
  return {
    id: lead._id.toString(),
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    country: lead.country || '',
    city: lead.city || '',
    website: lead.website || '',
    supplierType: lead.supplierType,
    categories: lead.categories || [],
    products: lead.products || [],
    documentsReady: lead.documentsReady || [],
    message: lead.message || '',
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

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

router.get(
  '/leads',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const filter =
      status && ['new', 'reviewing', 'accepted', 'rejected'].includes(status)
        ? { status }
        : {};

    const leads = await SupplierLead.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ leads: leads.map(serializeLead) });
  })
);

router.patch(
  '/leads/:id',
  requireAdminKey,
  asyncHandler(async (req, res) => {
    const statusSchema = z.object({
      status: z.enum(['new', 'reviewing', 'accepted', 'rejected']),
    });
    const { status } = statusSchema.parse(req.body);

    const lead = await SupplierLead.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ lead: serializeLead(lead) });
  })
);

export default router;
