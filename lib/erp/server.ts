import { getErpBaseUrl, getErpHeaders, getErpOrgId } from './config';
import { extractProductsFromResponse, extractQuotationId, normalizeProducts } from './products';
import type {
  ErpProductsResponse,
  ErpQuoteRequestPayload,
  ErpQuoteRequestResponse,
  MarketplaceProduct,
} from './types';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('ERP returned an invalid response');
  }
}

export async function fetchErpProducts(): Promise<MarketplaceProduct[]> {
  const baseUrl = getErpBaseUrl();
  // orgId via X-Org-Id header (Option 2)
  const url = `${baseUrl}/api/stock/public/products`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: getErpHeaders(),
      cache: 'no-store',
    });
  } catch {
    throw new Error(
      `Cannot reach ERP at ${baseUrl}. Start your local ERP on port 5010 or set ERP_API_BASE_URL.`
    );
  }

  const payload = await parseJsonResponse<ErpProductsResponse | MarketplaceProduct[]>(response);

  if (!response.ok) {
    const message =
      (payload as ErpProductsResponse).message ||
      `ERP returned ${response.status} from ${baseUrl}`;
    throw new Error(message);
  }

  const erpPayload = payload as ErpProductsResponse;
  if (erpPayload.success === false) {
    throw new Error(erpPayload.message || 'ERP rejected the products request');
  }

  const rawProducts = extractProductsFromResponse(erpPayload);
  return normalizeProducts(rawProducts, baseUrl);
}

export async function createErpQuoteRequest(
  body: Omit<ErpQuoteRequestPayload, 'orgId'>
): Promise<{ quotationId: string; raw: ErpQuoteRequestResponse }> {
  const orgId = getErpOrgId();
  const url = `${getErpBaseUrl()}/api/stock/public/quote-requests`;

  // orgId in body (Option 3) and X-Org-Id header (Option 2)
  const response = await fetch(url, {
    method: 'POST',
    headers: getErpHeaders(),
    body: JSON.stringify({ ...body, orgId }),
  });

  const payload = await parseJsonResponse<ErpQuoteRequestResponse>(response);

  if (!response.ok) {
    throw new Error(payload.message || `Quote request failed (${response.status})`);
  }

  const quotationId = extractQuotationId(payload);
  if (!quotationId) {
    throw new Error('ERP did not return a quotation ID');
  }

  return { quotationId, raw: payload };
}

async function fetchPdfFromErp(
  path: string,
  method: 'GET' | 'POST',
  resourceLabel: string
): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
}> {
  const baseUrl = getErpBaseUrl();
  const orgId = getErpOrgId();
  const url = `${baseUrl}${path}?orgId=${encodeURIComponent(orgId)}`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, { method, headers: getErpHeaders('') });
    } catch {
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      throw new Error(`Cannot reach ERP at ${baseUrl}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (response.ok && contentType.includes('application/pdf')) {
      return {
        buffer: await response.arrayBuffer(),
        contentType: 'application/pdf',
      };
    }

    const payload = await parseJsonResponse<{ message?: string }>(response);
    const message =
      payload.message ||
      (response.ok
        ? `ERP returned ${contentType || 'an unexpected format'} instead of a PDF`
        : `Failed to download ${resourceLabel} (${response.status})`);

    if (response.ok === false && response.status >= 500 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      continue;
    }

    lastError = new Error(message);
    break;
  }

  throw lastError || new Error(`Failed to download ${resourceLabel}`);
}

export async function fetchErpQuotationPdf(quotationId: string): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
  filename: string;
}> {
  const result = await fetchPdfFromErp(
    `/api/stock/public/quotations/${encodeURIComponent(quotationId)}/pdf`,
    'GET',
    'quotation PDF'
  );
  return {
    ...result,
    filename: `quotation-${quotationId}.pdf`,
  };
}

async function resolveErpInvoiceId(quotationId: string): Promise<string | null> {
  const baseUrl = getErpBaseUrl();
  const orgId = getErpOrgId();
  const url = `${baseUrl}/api/stock/public/quotations/${encodeURIComponent(quotationId)}/request-invoice?orgId=${encodeURIComponent(orgId)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...getErpHeaders(''), Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const payload = await parseJsonResponse<{ data?: { invoiceId?: string } }>(response);
  return payload?.data?.invoiceId ?? null;
}

/** Streams the ERP-generated invoice PDF — same document as the ERP UI. */
export async function fetchErpInvoicePdf(input: {
  invoiceId?: string;
  quotationId: string;
}): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
  filename: string;
  invoiceId: string;
}> {
  const id = input.invoiceId || input.quotationId;

  try {
    const result = await fetchPdfFromErp(
      `/api/stock/public/invoices/${encodeURIComponent(id)}/pdf`,
      'GET',
      'invoice PDF'
    );
    return { ...result, filename: `invoice-${id}.pdf`, invoiceId: id };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (!message.includes('404') && !message.includes('not found')) throw err;
  }

  const invoiceId = await resolveErpInvoiceId(input.quotationId);
  if (!invoiceId) throw new Error('Invoice not found');

  const result = await fetchPdfFromErp(
    `/api/stock/public/invoices/${encodeURIComponent(invoiceId)}/pdf`,
    'GET',
    'invoice PDF'
  );
  return { ...result, filename: `invoice-${invoiceId}.pdf`, invoiceId };
}
