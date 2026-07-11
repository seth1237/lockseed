import { NextResponse } from 'next/server';
import { proxyQuotationPdf } from '@/lib/erp/pdf-proxy';

// GET /api/quotations/{quotationId}/pdf?orgId=...
// Forwards to the ERP and streams the same quotation PDF back, unchanged.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 });
  }
  return proxyQuotationPdf(id);
}
