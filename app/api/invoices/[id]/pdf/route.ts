import { NextResponse } from 'next/server';
import { proxyInvoicePdf } from '@/lib/erp/pdf-proxy';

// GET /api/invoices/{invoiceId}/pdf?quotationId=...
// Forwards to the ERP public PDF endpoint and streams the ERP-generated PDF unchanged.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }

  const quotationId = new URL(request.url).searchParams.get('quotationId') || undefined;
  return proxyInvoicePdf(id, { request, quotationId });
}
