import { NextResponse } from 'next/server';
import { fetchErpProducts } from '@/lib/erp/server';

export async function GET() {
  try {
    const products = await fetchErpProducts();
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load products';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
