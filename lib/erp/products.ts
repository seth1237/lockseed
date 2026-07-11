import type { ErpProductRaw, ErpProductsResponse, MarketplaceProduct } from './types';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23E8EBE1" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%234C5A50"%3EMedical Product%3C/text%3E%3C/svg%3E';

export function extractProductsFromResponse(payload: ErpProductsResponse | ErpProductRaw[]): ErpProductRaw[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.products)) {
    return payload.products;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload.data && typeof payload.data === 'object' && 'products' in payload.data) {
    const nested = payload.data.products;
    if (Array.isArray(nested)) {
      return nested;
    }
  }

  return [];
}

function formatCategory(raw: ErpProductRaw): string {
  if (raw.productType) {
    return raw.productType.charAt(0).toUpperCase() + raw.productType.slice(1);
  }
  const cat = raw.categoryName || raw.category;
  if (cat && !/^[a-f0-9]{24}$/i.test(cat)) {
    return String(cat);
  }
  return 'Catalog';
}

export function resolveErpAssetUrl(path: string | undefined, erpBaseUrl: string): string {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const base = erpBaseUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function normalizeProduct(
  raw: ErpProductRaw,
  erpBaseUrl?: string
): MarketplaceProduct | null {
  const id = raw._id || raw.id || raw.productId;
  const name = raw.name || raw.productName || raw.title;

  if (!id || !name || raw.isActive === false) {
    return null;
  }

  const unitPrice =
    raw.sellingPrice ?? raw.unitPrice ?? raw.price ?? raw.costPrice ?? 0;

  const stock = raw.currentQuantity ?? raw.stock ?? raw.stockQuantity ?? raw.quantity;

  const imagePath = raw.imageUrl || raw.image || raw.photo;

  return {
    id: String(id),
    name: String(name),
    description: raw.description || name,
    category: formatCategory(raw),
    unitPrice: Number(unitPrice) || 0,
    image: erpBaseUrl ? resolveErpAssetUrl(imagePath, erpBaseUrl) : imagePath || PLACEHOLDER_IMAGE,
    sku: raw.sku,
    unit: raw.unit || 'unit',
    inStock: stock === undefined ? true : Number(stock) > 0,
  };
}

export function normalizeProducts(
  rawList: ErpProductRaw[],
  erpBaseUrl?: string
): MarketplaceProduct[] {
  return rawList
    .map((raw) => normalizeProduct(raw, erpBaseUrl))
    .filter((product): product is MarketplaceProduct => product !== null);
}

export function formatPrice(amount: number, currency = 'KES'): string {
  if (!amount) return 'Price on request';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function extractQuotationId(response: {
  quotationId?: string;
  id?: string;
  _id?: string;
  data?: { quotationId?: string; id?: string; _id?: string };
}): string | null {
  return (
    response.quotationId ||
    response.data?.quotationId ||
    response.data?.id ||
    response.data?._id ||
    response.id ||
    response._id ||
    null
  );
}
