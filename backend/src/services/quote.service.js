import { QuoteRequest } from '../models/QuoteRequest.js';
import { Notification } from '../models/Notification.js';
import { createQuoteRequest, fetchQuotationState } from '../integrations/erp.service.js';
import { findOrCreateForQuote, issueSession, getCurrentUser } from './auth.service.js';
import { sendQuotationEmail } from './email.service.js';

/** Maps an ERP quotation/invoice state onto the website's quote status. */
function mapErpStateToStatus(state) {
  if (!state) return null;
  const s = String(state.status || '').toLowerCase();
  const inv = String(state.invoiceStatus || '').toLowerCase();

  if (inv === 'paid' || s === 'paid' || s === 'completed' || s === 'complete') {
    return 'completed';
  }
  if (state.convertedInvoiceId || s === 'converted' || s === 'invoiced') {
    return 'invoiced';
  }
  if (s === 'approved' || s === 'accepted') {
    return 'quoted';
  }
  if (s === 'pending_approval' || s === 'pending' || s === 'draft') {
    return 'pending';
  }
  return null;
}

/**
 * Pulls the latest state for a user's non-final quotes from the ERP and
 * updates the local status + invoiceId so the portal reflects conversions.
 * Fully graceful: if the ERP state endpoint is unavailable, nothing changes.
 */
export async function syncQuotesFromErp(userId) {
  const quotes = await QuoteRequest.find({
    userId,
    status: { $nin: ['completed'] },
  })
    .limit(50)
    .lean();

  await Promise.all(
    quotes.map(async (q) => {
      const state = await fetchQuotationState(q.quotationId);
      if (!state) return;

      const updates = {};
      const mapped = mapErpStateToStatus(state);
      if (mapped && mapped !== q.status) updates.status = mapped;
      if (state.convertedInvoiceId && state.convertedInvoiceId !== q.invoiceId) {
        updates.invoiceId = state.convertedInvoiceId;
      }

      if (Object.keys(updates).length > 0) {
        await QuoteRequest.updateOne({ _id: q._id }, updates);
      }
    })
  );
}

export async function submitQuote(req, res, body) {
  const { user, isNewUser } = await findOrCreateForQuote({
    email: body.email,
    name: body.clientName,
    phone: body.clientNumber,
    location: body.clientLocation,
  });

  const quotationId = await createQuoteRequest({
    clientName: body.clientName,
    clientNumber: body.clientNumber,
    clientLocation: body.clientLocation,
    email: body.email,
    items: body.items,
  });

  const item = body.items[0];
  const quote = await QuoteRequest.create({
    userId: user._id,
    quotationId,
    status: 'pending',
    productId: item?.productId,
    productName: body.productName,
    quantity: item?.quantity,
    unitPrice: item?.unitPrice,
    clientLocation: body.clientLocation,
    notes: body.notes,
  });

  await Notification.create({
    userId: user._id,
    title: 'Quotation submitted',
    message: 'Your quotation has been submitted successfully.',
  });

  await sendQuotationEmail({ to: user.email, name: user.name, quotationId });

  const current = await getCurrentUser(req, null);
  if (!current) await issueSession(res, user);

  return { quote, quotationId, isNewUser };
}

export async function saveInvoiceId(quotationId, invoiceId, userId) {
  await QuoteRequest.findOneAndUpdate(
    { quotationId, userId },
    { invoiceId, status: 'invoiced' },
    { new: true }
  );
}

export async function getDashboard(userId) {
  // Reflect any ERP-side changes (approval, conversion to invoice) before reading.
  await syncQuotesFromErp(userId).catch(() => {});

  const [quotes, notifications] = await Promise.all([
    QuoteRequest.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  return {
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
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
    })),
    orders: [],
    invoices: quotes
      .filter((q) => ['confirmed', 'invoiced'].includes(q.status))
      .map((q) => ({ quotationId: q.quotationId, status: q.status })),
  };
}
