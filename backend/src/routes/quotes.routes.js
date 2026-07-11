import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { submitQuote, saveInvoiceId, syncQuotesFromErp } from '../services/quote.service.js';
import { QuoteRequest } from '../models/QuoteRequest.js';

const router = Router();

const quoteSchema = z.object({
  clientName: z.string().min(2),
  clientNumber: z.string().min(5),
  clientLocation: z.string().min(2),
  email: z.string().email(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1),
  notes: z.string().optional(),
  productName: z.string().optional(),
});

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    await syncQuotesFromErp(req.user._id).catch(() => {});
    const quotes = await QuoteRequest.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({
      quotes: quotes.map((q) => ({
        id: q._id.toString(),
        quotationId: q.quotationId,
        invoiceId: q.invoiceId,
        status: q.status,
        productId: q.productId,
        productName: q.productName,
        quantity: q.quantity,
        unitPrice: q.unitPrice,
        clientLocation: q.clientLocation,
        createdAt: q.createdAt,
      })),
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = quoteSchema.parse(req.body);
    const result = await submitQuote(req, res, body);
    res.json({
      success: true,
      quotationId: result.quotationId,
      isNewUser: result.isNewUser,
    });
  })
);

router.post(
  '/:quotationId/invoice-id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { invoiceId } = z.object({ invoiceId: z.string().min(1) }).parse(req.body);
    await saveInvoiceId(req.params.quotationId, invoiceId, req.user._id);
    res.json({ success: true, invoiceId });
  })
);

export default router;
