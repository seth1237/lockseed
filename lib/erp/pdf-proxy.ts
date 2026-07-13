import { NextResponse } from 'next/server';
import { getErpBaseUrl, getErpHeaders, getErpOrgId } from './config';

// Server-side (Next.js route handler) call to the Express backend — needs an
// absolute origin, so it uses BACKEND_ORIGIN rather than the relative proxy prefix.
const BACKEND_URL = (
  process.env.BACKEND_ORIGIN ||
  'https://lockseed.codewithseth.co.ke'
).replace(/\/+$/, '');

/**
 * Streams a PDF straight from the ERP to the browser, byte-for-byte.
 * The website never generates or re-renders the document — it only forwards it.
 */
async function callErp(
  path: string,
  method: 'GET' | 'POST',
  accept = 'application/pdf'
): Promise<Response> {
  const baseUrl = getErpBaseUrl();
  const orgId = getErpOrgId();
  const url = `${baseUrl}${path}?orgId=${encodeURIComponent(orgId)}`;
  return fetch(url, {
    method,
    headers: { ...getErpHeaders(''), Accept: accept },
    cache: 'no-store',
  });
}

/**
 * Resolves the ERP invoiceId for a quotation without downloading a throwaway PDF.
 * With `Accept: application/json`, request-invoice returns
 * { data: { invoiceId, invoiceNumber, ... } } and is idempotent on the ERP side.
 */
async function resolveInvoiceId(quotationId: string): Promise<string | null> {
  const res = await callErp(
    `/api/stock/public/quotations/${encodeURIComponent(quotationId)}/request-invoice`,
    'POST',
    'application/json'
  );
  if (!res.ok) return null;
  const payload = await res
    .json()
    .catch(() => ({}) as { data?: { invoiceId?: string } });
  return payload?.data?.invoiceId ?? null;
}

async function persistInvoiceId(
  quotationId: string,
  invoiceId: string,
  request?: Request
): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/quotes/${encodeURIComponent(quotationId)}/invoice-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request?.headers.get('cookie') || '',
      },
      body: JSON.stringify({ invoiceId }),
    });
  } catch {
    // Non-blocking — download still succeeds if persistence fails.
  }
}

function isPdf(res: Response): boolean {
  return res.ok && (res.headers.get('content-type') || '').includes('application/pdf');
}

function streamPdf(res: Response, downloadName: string): NextResponse {
  return new NextResponse(res.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${downloadName}"`,
      'Cache-Control': 'no-store',
    },
  });
}

async function erpError(res: Response): Promise<NextResponse> {
  const payload = await res.json().catch(() => ({}) as { message?: string });
  return NextResponse.json(
    { error: payload.message || 'ERP did not return a PDF' },
    { status: res.ok ? 502 : res.status }
  );
}

export async function proxyQuotationPdf(quotationId: string): Promise<NextResponse> {
  let res: Response;
  try {
    res = await callErp(
      `/api/stock/public/quotations/${encodeURIComponent(quotationId)}/pdf`,
      'GET'
    );
  } catch {
    return NextResponse.json({ error: `Cannot reach ERP at ${getErpBaseUrl()}` }, { status: 502 });
  }

  return isPdf(res) ? streamPdf(res, `quotation-${quotationId}.pdf`) : erpError(res);
}

async function fetchErpInvoicePdf(invoiceId: string): Promise<Response> {
  return callErp(`/api/stock/public/invoices/${encodeURIComponent(invoiceId)}/pdf`, 'GET');
}

export async function proxyInvoicePdf(
  id: string,
  options?: { request?: Request; quotationId?: string }
): Promise<NextResponse> {
  const quotationId = options?.quotationId || id;

  // If we already have the ERP invoiceId, fetch the PDF directly from the ERP generator.
  let res: Response;
  try {
    res = await fetchErpInvoicePdf(id);
  } catch {
    return NextResponse.json({ error: `Cannot reach ERP at ${getErpBaseUrl()}` }, { status: 502 });
  }

  if (isPdf(res)) {
    return streamPdf(res, `invoice-${id}.pdf`);
  }

  // The id is a quotationId — resolve the linked invoiceId (idempotent on ERP).
  if (res.status === 404) {
    let invoiceId: string | null;
    try {
      invoiceId = await resolveInvoiceId(quotationId);
    } catch {
      return NextResponse.json({ error: `Cannot reach ERP at ${getErpBaseUrl()}` }, { status: 502 });
    }

    if (!invoiceId) return erpError(res);

    await persistInvoiceId(quotationId, invoiceId, options?.request);

    let invoiceRes: Response;
    try {
      invoiceRes = await fetchErpInvoicePdf(invoiceId);
    } catch {
      return NextResponse.json({ error: `Cannot reach ERP at ${getErpBaseUrl()}` }, { status: 502 });
    }

    return isPdf(invoiceRes)
      ? streamPdf(invoiceRes, `invoice-${invoiceId}.pdf`)
      : erpError(invoiceRes);
  }

  return erpError(res);
}
