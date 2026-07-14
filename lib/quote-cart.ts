export type QuoteCartItem = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

const STORAGE_KEY = 'lockseed_quote_cart';

function read(): QuoteCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: QuoteCartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('lockseed-quote-cart'));
}

export function getQuoteCart(): QuoteCartItem[] {
  return read();
}

export function getQuoteCartCount(): number {
  return read().reduce((sum, i) => sum + (i.quantity || 0), 0);
}

export function setQuoteCart(items: QuoteCartItem[]) {
  write(items.filter((i) => i.productId && i.quantity > 0));
}

export function addToQuoteCart(item: Omit<QuoteCartItem, 'quantity'> & { quantity?: number }) {
  const items = read();
  const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const idx = items.findIndex((i) => i.productId === item.productId);
  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      quantity: items[idx].quantity + qty,
      productName: item.productName || items[idx].productName,
      unitPrice: item.unitPrice ?? items[idx].unitPrice,
    };
  } else {
    items.push({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice || 0,
      quantity: qty,
    });
  }
  write(items);
  return items;
}

export function updateQuoteCartQuantity(productId: string, quantity: number) {
  const items = read()
    .map((i) => (i.productId === productId ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  write(items);
  return items;
}

export function removeFromQuoteCart(productId: string) {
  const items = read().filter((i) => i.productId !== productId);
  write(items);
  return items;
}

export function clearQuoteCart() {
  write([]);
}

export function summaryProductName(items: QuoteCartItem[]): string {
  if (items.length === 0) return 'Quotation';
  if (items.length === 1) return items[0].productName;
  return `${items[0].productName} +${items.length - 1} more`;
}
