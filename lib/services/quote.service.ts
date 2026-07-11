import { connectDB } from '@/lib/db/mongoose';
import { QuoteRequest } from '@/lib/models/QuoteRequest';
import { Notification } from '@/lib/models/Notification';
import { createErpQuoteRequest } from '@/lib/erp/server';
import { findOrCreateUserForQuote, issueAuthSession, getCurrentUser } from '@/lib/services/auth.service';
import { sendQuotationCreatedEmail } from '@/lib/services/email.service';
import type { QuoteRequestItem } from '@/lib/erp/types';

export async function createQuoteForUser(input: {
  clientName: string;
  clientNumber: string;
  clientLocation: string;
  email: string;
  items: QuoteRequestItem[];
  notes?: string;
  productName?: string;
}) {
  if (!input.items.length) {
    throw new Error('At least one product is required');
  }

  const firstItem = input.items[0];
  const { user, isNewUser } = await findOrCreateUserForQuote({
    email: input.email,
    name: input.clientName,
    phone: input.clientNumber,
    location: input.clientLocation,
  });

  const { quotationId } = await createErpQuoteRequest({
    clientName: input.clientName,
    clientNumber: input.clientNumber,
    clientLocation: input.clientLocation,
    email: input.email,
    items: input.items,
  });

  await connectDB();
  const quote = await QuoteRequest.create({
    userId: user._id,
    quotationId,
    status: 'pending',
    productId: firstItem.productId,
    productName: input.productName,
    quantity: firstItem.quantity,
    unitPrice: firstItem.unitPrice,
    clientLocation: input.clientLocation,
    notes: input.notes,
  });

  await Notification.create({
    userId: user._id,
    title: 'Quotation submitted',
    message: 'Your quotation has been submitted successfully.',
  });

  await sendQuotationCreatedEmail({
    to: user.email,
    name: user.name,
    quotationId,
  });

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    await issueAuthSession(user);
  }

  return { quote, user, quotationId, isNewUser };
}

export async function getUserQuotes(userId: string) {
  await connectDB();
  return QuoteRequest.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getUserDashboard(userId: string) {
  await connectDB();
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
      .filter((q) => q.status === 'confirmed' || q.status === 'invoiced')
      .map((q) => ({
        quotationId: q.quotationId,
        status: q.status,
      })),
  };
}
