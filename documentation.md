# ERP PDF Download Integration

The website **never generates PDFs**. All quotation and invoice documents are produced by the ERP (`generateQuotationPdf` / `generateInvoicePdf` via jsPDF) and streamed to the browser unchanged.

## Architecture

```
Browser
   │
   ▼
Website proxy (Next.js)
   GET /api/quotations/{quotationId}/pdf
   GET /api/invoices/{invoiceId}/pdf?quotationId=...
   │
   ▼
ERP public endpoints
   GET /api/stock/public/quotations/{quotationId}/pdf?orgId=...
   GET /api/stock/public/invoices/{invoiceId}/pdf?orgId=...
   │
   ▼
ERP runs generateQuotationPdf() / generateInvoicePdf()
   │
   ▼
application/pdf streamed byte-for-byte to the browser
```

The website has **no** `jspdf`, **no** PDF templates, and **no** document layout code.

## Website endpoints

| Endpoint | ERP endpoint | Document |
|----------|--------------|----------|
| `GET /api/quotations/{quotationId}/pdf` | `GET /api/stock/public/quotations/{id}/pdf` | Quotation |
| `GET /api/invoices/{invoiceId}/pdf` | `GET /api/stock/public/invoices/{id}/pdf` | Invoice |

Implementation: `lib/erp/pdf-proxy.ts`, `app/api/quotations/[id]/pdf/route.ts`, `app/api/invoices/[id]/pdf/route.ts`

## Invoice flow (first download)

When only a `quotationId` is known:

1. `POST /api/stock/public/quotations/{quotationId}/request-invoice` with `Accept: application/json`
2. ERP returns `{ data: { invoiceId, invoiceNumber } }` (idempotent — reuses existing invoice)
3. Website stores `invoiceId` on the quote record
4. `GET /api/stock/public/invoices/{invoiceId}/pdf` — streams the ERP-generated PDF

Subsequent downloads use the stored `invoiceId` directly.

## Tenant context

Pass `orgId` via query parameter and `X-Org-Id` header. Configure in `.env.local`:

```
ERP_API_BASE_URL=http://localhost:5010
ERP_ORG_ID=your-org-id
```

Production: `https://backend.codewithseth.co.ke` — no bearer token required for public PDF routes.

## Rules

- **Do** proxy PDF bytes from the ERP unchanged.
- **Do** validate `Content-Type: application/pdf` before saving or streaming.
- **Do not** copy `invoicePdf.service.ts` or any jsPDF code into the website.
- **Do not** cache or store PDF files on the website — always fetch fresh from the ERP.

## Error handling

| Status | Meaning |
|--------|---------|
| 403 | Quotation pending approval (quotation PDF not ready) |
| 404 | Invoice or quotation not found for tenant |
| 502 | ERP unreachable or returned non-PDF body |

Errors are returned as JSON — never saved as a `.pdf` file.
