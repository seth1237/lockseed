import { getErpBaseUrl, getErpOrgId, getErpHeaders, getErpPdfHeaders } from '../config/erpApi.js';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23E8EBE1" width="400" height="300"/%3E%3C/svg%3E';

function extractProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function formatCategory(raw) {
  if (raw.productType) return raw.productType.charAt(0).toUpperCase() + raw.productType.slice(1);
  const cat = raw.categoryName || raw.category;
  if (cat && !/^[a-f0-9]{24}$/i.test(cat)) return String(cat);
  return 'Catalog';
}

function resolveImage(path, base) {
  if (!path) return PLACEHOLDER;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeProduct(raw, baseUrl) {
  const id = raw._id || raw.id;
  const name = raw.name;
  if (!id || !name || raw.isActive === false) return null;
  const stock = raw.currentQuantity ?? raw.stock;
  return {
    id: String(id),
    name: String(name),
    description: raw.description || name,
    category: formatCategory(raw),
    unitPrice: Number(raw.sellingPrice ?? raw.unitPrice ?? raw.price ?? 0),
    image: resolveImage(raw.imageUrl || raw.image, baseUrl),
    inStock: stock === undefined ? true : Number(stock) > 0,
  };
}

function extractQuotationId(payload) {
  return (
    payload?.quotationId ||
    payload?.data?.quotationId ||
    payload?.data?._id ||
    payload?._id ||
    payload?.id ||
    null
  );
}

export async function fetchProducts() {
  const baseUrl = getErpBaseUrl();
  const url = `${baseUrl}/api/stock/public/products`;
  let res;
  try {
    res = await fetch(url, { headers: getErpHeaders() });
  } catch {
    throw new Error(`Cannot reach ERP at ${baseUrl}. Is it running on port 5010?`);
  }
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || `ERP error ${res.status}`);
  if (payload.success === false) throw new Error(payload.message || 'ERP rejected request');
  return extractProducts(payload)
    .map((p) => normalizeProduct(p, baseUrl))
    .filter(Boolean);
}

export async function createQuoteRequest(body) {
  const baseUrl = getErpBaseUrl();
  const orgId = getErpHeaders()['X-Org-Id'];
  const res = await fetch(`${baseUrl}/api/stock/public/quote-requests`, {
    method: 'POST',
    headers: getErpHeaders(),
    body: JSON.stringify({ ...body, orgId }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || `Quote failed (${res.status})`);
  const quotationId = extractQuotationId(payload);
  if (!quotationId) throw new Error('ERP did not return a quotation ID');
  return quotationId;
}

/**
 * Reads the current ERP state of a quotation (read-only, non-mutating).
 * Expects the ERP public endpoint:
 *   GET /api/stock/public/quotations/:quotationId/state?orgId=...
 *   -> { success, data: { status, convertedInvoiceId?, invoiceStatus? } }
 * Returns null if the endpoint is unavailable so the sync degrades gracefully.
 */
export async function fetchQuotationState(quotationId) {
  const baseUrl = getErpBaseUrl();
  const orgId = getErpOrgId();
  const url = `${baseUrl}/api/stock/public/quotations/${encodeURIComponent(quotationId)}/state?orgId=${encodeURIComponent(orgId)}`;

  let res;
  try {
    res = await fetch(url, { headers: getErpHeaders() });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const payload = await res.json().catch(() => ({}));
  const data = payload?.data ?? payload;
  if (!data || typeof data !== 'object') return null;

  return {
    status: data.status ?? data.quotationStatus ?? null,
    convertedInvoiceId: data.convertedInvoiceId ?? data.invoiceId ?? null,
    invoiceStatus: data.invoiceStatus ?? null,
  };
}

async function fetchPdfFromErp({ path, method = 'GET', resourceLabel }) {
  const baseUrl = getErpBaseUrl();
  const orgId = getErpOrgId();
  const url = `${baseUrl}${path}?orgId=${encodeURIComponent(orgId)}`;
  const headers = getErpPdfHeaders();

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    let res;
    try {
      res = await fetch(url, { method, headers });
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      throw new Error(`Cannot reach ERP at ${baseUrl}`);
    }

    const contentType = res.headers.get('content-type') || '';

    if (res.ok && contentType.includes('application/pdf')) {
      return {
        buffer: Buffer.from(await res.arrayBuffer()),
        contentType: 'application/pdf',
      };
    }

    // The ERP returned an error (or a non-PDF body). Never hand this back as a PDF.
    const payload = await res.json().catch(() => ({}));
    const message =
      payload.message ||
      (res.ok
        ? `ERP returned ${contentType || 'an unexpected format'} instead of a PDF`
        : `Failed to download ${resourceLabel} (${res.status})`);

    const retryable = res.ok === false && res.status >= 500;
    if (retryable && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      continue;
    }

    const err = new Error(message);
    err.status = res.ok ? 502 : res.status;
    throw err;
  }

  throw lastError || new Error(`Failed to download ${resourceLabel}`);
}

export async function downloadQuotationPdf(quotationId) {
  const result = await fetchPdfFromErp({
    path: `/api/stock/public/quotations/${encodeURIComponent(quotationId)}/pdf`,
    method: 'GET',
    resourceLabel: 'quotation PDF',
  });
  return {
    ...result,
    filename: `quotation-${quotationId}.pdf`,
  };
}

/**
 * Resolves the ERP invoiceId for a quotation (idempotent).
 * Uses JSON mode so we get metadata only — never a throwaway PDF body.
 */
export async function resolveInvoiceId(quotationId) {
  const baseUrl = getErpBaseUrl();
  const orgId = getErpOrgId();
  const url = `${baseUrl}/api/stock/public/quotations/${encodeURIComponent(quotationId)}/request-invoice?orgId=${encodeURIComponent(orgId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...getErpPdfHeaders(), Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const payload = await res.json().catch(() => ({}));
  return payload?.data?.invoiceId ?? null;
}

async function tryFetchInvoicePdf(invoiceId) {
  try {
    const result = await fetchPdfFromErp({
      path: `/api/stock/public/invoices/${encodeURIComponent(invoiceId)}/pdf`,
      method: 'GET',
      resourceLabel: 'invoice PDF',
    });
    return { ...result, filename: `invoice-${invoiceId}.pdf`, invoiceId };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Streams the ERP-generated invoice PDF (same document as the ERP UI).
 * Never generates a PDF locally — only calls ERP public endpoints.
 */
export async function downloadInvoicePdf(id, quotationId = id) {
  const direct = await tryFetchInvoicePdf(id);
  if (direct) return { ...direct, quotationId };

  const invoiceId = await resolveInvoiceId(quotationId);
  if (!invoiceId) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  const result = await fetchPdfFromErp({
    path: `/api/stock/public/invoices/${encodeURIComponent(invoiceId)}/pdf`,
    method: 'GET',
    resourceLabel: 'invoice PDF',
  });

  return {
    ...result,
    filename: `invoice-${invoiceId}.pdf`,
    invoiceId,
    quotationId,
  };
}
