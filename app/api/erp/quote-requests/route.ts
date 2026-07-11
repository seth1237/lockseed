import { NextResponse } from 'next/server';
import { createErpQuoteRequest } from '@/lib/erp/server';
import type { ErpQuoteRequestPayload } from '@/lib/erp/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<ErpQuoteRequestPayload, 'orgId'>;

    if (!body.clientName?.trim()) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }
    if (!body.clientNumber?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!body.clientLocation?.trim()) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'At least one product item is required' }, { status: 400 });
    }

    const { quotationId } = await createErpQuoteRequest(body);
    return NextResponse.json({ quotationId, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit quote request';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
