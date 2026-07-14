import type { ErpQuoteRequestPayload, MarketplaceProduct } from '@/lib/erp/types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

export async function fetchProducts(): Promise<MarketplaceProduct[]> {
  const response = await fetch(`${API_BASE}/api/erp/products`, { cache: 'no-store' });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load products');
  }

  return payload.products as MarketplaceProduct[];
}

export async function submitQuoteRequest(
  body: Omit<ErpQuoteRequestPayload, 'orgId'> & {
    productName?: string;
    notes?: string;
    company?: string;
    password?: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      productName?: string;
    }[];
  }
): Promise<{ quotationId: string; isNewUser?: boolean }> {
  const response = await fetch(`${API_BASE}/api/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to submit quote request');
  }

  return {
    quotationId: payload.quotationId as string,
    isNewUser: payload.isNewUser as boolean | undefined,
  };
}

// PDF downloads go through the same-origin Next.js proxy routes, which forward
// the request to the ERP and stream back the exact document the ERP generated.
async function downloadPdf(path: string, filename: string): Promise<void> {
  const response = await fetch(path, { credentials: 'include' });

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok || !contentType.includes('application/pdf')) {
    // Do not save an error/JSON body as a .pdf — surface the real message instead.
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || payload.message || `Failed to download ${filename}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadQuotationPdf(quotationId: string): Promise<void> {
  return downloadPdf(
    `/api/quotations/${encodeURIComponent(quotationId)}/pdf`,
    `quotation-${quotationId}.pdf`
  );
}

export async function downloadInvoicePdf(input: {
  invoiceId?: string;
  quotationId: string;
}): Promise<void> {
  const id = input.invoiceId || input.quotationId;
  const qs = `?quotationId=${encodeURIComponent(input.quotationId)}`;
  return downloadPdf(
    `/api/invoices/${encodeURIComponent(id)}/pdf${qs}`,
    `invoice-${id}.pdf`
  );
}

/** @deprecated Use downloadQuotationPdf or downloadInvoicePdf */
export async function downloadQuotationInvoice(quotationId: string): Promise<void> {
  return downloadInvoicePdf({ quotationId });
}
