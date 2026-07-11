/** Raw product shape from ERP — fields vary by deployment */
export interface ErpProductRaw {
  _id?: string;
  id?: string;
  productId?: string;
  name?: string;
  productName?: string;
  title?: string;
  description?: string;
  category?: string;
  categoryName?: string;
  unitPrice?: number;
  price?: number;
  sellingPrice?: number;
  costPrice?: number;
  quantity?: number;
  stock?: number;
  stockQuantity?: number;
  image?: string;
  imageUrl?: string;
  photo?: string;
  sku?: string;
  unit?: string;
  brand?: string;
  productType?: string;
  currentQuantity?: number;
  isActive?: boolean;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  image: string;
  sku?: string;
  unit?: string;
  inStock: boolean;
}

export interface QuoteRequestItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface ErpQuoteRequestPayload {
  orgId: string;
  clientName: string;
  clientNumber: string;
  clientLocation: string;
  email: string;
  items: QuoteRequestItem[];
}

export interface ErpQuoteRequestResponse {
  quotationId?: string;
  id?: string;
  _id?: string;
  referenceNumber?: string;
  message?: string;
  success?: boolean;
  data?: {
    quotationId?: string;
    id?: string;
    _id?: string;
    referenceNumber?: string;
  };
}

export interface ErpProductsResponse {
  success?: boolean;
  data?: ErpProductRaw[] | { products?: ErpProductRaw[] };
  products?: ErpProductRaw[];
  message?: string;
}
