import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { attachUserIfPresent } from '../middlewares/auth.middleware.js';
import {
  fetchProducts,
  downloadQuotationPdf,
  downloadInvoicePdf,
} from '../integrations/erp.service.js';
import { saveInvoiceId } from '../services/quote.service.js';

const router = Router();

function sendPdf(res, { buffer, contentType, filename }) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.send(buffer);
}

router.get(
  '/products',
  asyncHandler(async (_req, res) => {
    const products = await fetchProducts();
    res.json({ products });
  })
);

// Quotation PDF — streams ERP generateQuotationPdf() output unchanged.
router.get(
  '/quotations/:quotationId/pdf',
  asyncHandler(async (req, res) => {
    const pdf = await downloadQuotationPdf(req.params.quotationId);
    sendPdf(res, pdf);
  })
);

// Invoice PDF — resolves invoiceId if needed, then streams ERP generateInvoicePdf() output.
router.get(
  '/invoices/:invoiceId/pdf',
  attachUserIfPresent,
  asyncHandler(async (req, res) => {
    const quotationId = req.query.quotationId || req.params.invoiceId;
    const pdf = await downloadInvoicePdf(req.params.invoiceId, quotationId);

    if (pdf.invoiceId && pdf.quotationId && req.user) {
      await saveInvoiceId(pdf.quotationId, pdf.invoiceId, req.user._id);
    }

    sendPdf(res, pdf);
  })
);

export default router;
