import { z } from 'zod';
import { requireAuth } from '@/lib/api/helpers';
import { getUserQuotes, createQuoteForUser } from '@/lib/services/quote.service';
import { jsonError } from '@/lib/api/helpers';

const createSchema = z.object({
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

export async function GET() {
  const { user, error } = await requireAuth();
  if (error || !user) return error!;

  const quotes = await getUserQuotes(user._id.toString());
  return Response.json({
    quotes: quotes.map((q) => ({
      id: q._id.toString(),
      quotationId: q.quotationId,
      status: q.status,
      productId: q.productId,
      productName: q.productName,
      quantity: q.quantity,
      unitPrice: q.unitPrice,
      clientLocation: q.clientLocation,
      notes: q.notes,
      createdAt: q.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    const result = await createQuoteForUser(body);
    return Response.json({
      success: true,
      quotationId: result.quotationId,
      isNewUser: result.isNewUser,
      quote: {
        id: result.quote._id.toString(),
        quotationId: result.quotationId,
        status: result.quote.status,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.issues[0]?.message || 'Invalid quote data');
    }
    return jsonError(err instanceof Error ? err.message : 'Quote creation failed', 502);
  }
}
