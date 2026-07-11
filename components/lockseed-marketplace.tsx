'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  Package,
  X,
  ArrowRight,
  CheckCircle2,
  Truck,
  LogOut,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getMe } from '@/lib/website-api';
import type { WebsiteUser } from '@/lib/website-api';
import { fetchProducts, submitQuoteRequest } from '@/lib/erp-api';
import type { MarketplaceProduct } from '@/lib/erp/types';
import { formatPrice } from '@/lib/erp/products';

type QuoteForm = {
  clientName: string;
  email: string;
  clientNumber: string;
  clientLocation: string;
  quantity: string;
  notes: string;
};

type LocalRfq = {
  ref: string;
  quotationId: string;
  product: string;
  qty: string;
  email: string;
  date: string;
  status: 'Pending';
};

function VerifiedSeal({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 40 : 60;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: sz, height: sz }}>
      <ShieldCheck width={sz * 0.7} height={sz * 0.7} color="#1F4D3A" fill="#1F4D3A" />
    </div>
  );
}

function ProductCard({
  product,
  onQuickQuote,
}: {
  product: MarketplaceProduct;
  onQuickQuote: () => void;
}) {
  const router = useRouter();

  return (
    <div className="bg-white border border-[#D7DCCE] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="h-48 bg-gradient-to-br from-[#F1F3EC] to-[#E8EBE1] overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23E8EBE1" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%234C5A50"%3EProduct Image%3C/text%3E%3C/svg%3E';
          }}
        />
        {!product.inStock && (
          <span className="absolute top-3 right-3 bg-[#A13B2E] text-white text-xs font-semibold px-2 py-1 rounded-full">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <span className="inline-block bg-[#F1F3EC] text-[#1F4D3A] text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
              {product.category}
            </span>
            <h3 className="text-lg font-semibold text-[#16231C]">{product.name}</h3>
          </div>
          <VerifiedSeal size="sm" />
        </div>

        <p className="text-sm text-[#4C5A50] mb-4 line-clamp-2 flex-1">{product.description}</p>

        <div className="space-y-2 text-xs mb-6 border-t border-[#D7DCCE] pt-4">
          <div className="flex justify-between text-[#16231C]">
            <span className="font-medium">Unit price:</span>
            <span className="font-semibold text-[#f36b14]">{formatPrice(product.unitPrice)}</span>
          </div>
          {product.sku && (
            <div className="flex justify-between text-[#16231C]">
              <span className="font-medium">SKU:</span>
              <span>{product.sku}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() =>
              router.push(
                `/quote-request?productId=${encodeURIComponent(product.id)}&product=${encodeURIComponent(product.name)}&unitPrice=${product.unitPrice}`
              )
            }
            className="w-full bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Request Quote
          </button>
          <button
            onClick={onQuickQuote}
            className="w-full border-2 border-[#2E6650] text-[#2E6650] hover:bg-[#F1F3EC] font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Quick Quote
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-[#16231C] mb-2">{label}</label>
      {children}
    </div>
  );
}

export default function LockseedMarketplace() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [panelProduct, setPanelProduct] = useState<MarketplaceProduct | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastQuotation, setLastQuotation] = useState<LocalRfq | null>(null);
  const [session, setSession] = useState<WebsiteUser | null>(null);
  const [form, setForm] = useState<QuoteForm>({
    clientName: '',
    email: '',
    clientNumber: '',
    clientLocation: '',
    quantity: '',
    notes: '',
  });

  const loadProducts = async () => {
    setLoadingProducts(true);
    setProductsError('');
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    async function loadSession() {
      try {
        const { user } = await getMe();
        setSession(user);
        setForm((prev) => ({
          ...prev,
          clientName: user.company || user.name,
          email: user.email,
          clientNumber: user.phone || prev.clientNumber,
          clientLocation: user.address || prev.clientLocation,
        }));
      } catch {
        setSession(null);
      }
    }

    loadProducts();
    loadSession();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return ['All', ...cats];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchCat = activeCat === 'All' || product.category === activeCat;
    const matchQuery =
      !query ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const openQuickQuote = (product: MarketplaceProduct) => {
    setPanelProduct(product);
    setSubmitted(false);
    setSubmitError('');
    if (session) {
      setForm((prev) => ({
        ...prev,
        clientName: session.company || session.name,
        email: session.email,
        clientNumber: session.phone || prev.clientNumber,
        clientLocation: session.address || prev.clientLocation,
        quantity: '',
        notes: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!panelProduct || !form.clientName || !form.email || !form.clientNumber || !form.clientLocation || !form.quantity) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const quantity = Number(form.quantity);
      if (!quantity || quantity <= 0) {
        throw new Error('Enter a valid quantity');
      }

      const { quotationId } = await submitQuoteRequest({
        clientName: form.clientName,
        clientNumber: form.clientNumber,
        clientLocation: form.clientLocation,
        email: form.email,
        items: [
          {
            productId: panelProduct.id,
            quantity,
            unitPrice: panelProduct.unitPrice,
          },
        ],
        productName: panelProduct.name,
        notes: form.notes,
      });
      const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const rfq: LocalRfq = {
        ref: quotationId,
        quotationId,
        product: panelProduct.name,
        qty: form.quantity,
        email: form.email,
        date: today,
        status: 'Pending',
      };

      try {
        const { user } = await getMe();
        setSession(user);
      } catch {
        // auto-login cookies set by backend on new quote
      }
      setLastQuotation(rfq);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    form.clientName && form.email && form.clientNumber && form.clientLocation && form.quantity;

  return (
    <div className="min-h-screen bg-[#FCFCF9]">
      <header className="bg-white border-b border-[#D7DCCE] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(session ? '/auth' : '/')}
              className="flex items-center gap-2 text-[#1F4D3A] hover:text-[#f36b14] font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-mAseFfDMW3aKDSupzbbXpZO1faDURy.png"
              alt="Lockseed Supply"
              className="h-12 w-auto"
            />
          </div>
          <div className="text-center flex-1">
            <p className="text-xs uppercase tracking-widest text-[#4C5A50] font-semibold">
              {loadingProducts ? 'Loading catalog...' : `${products.length} ERP Products`}
            </p>
          </div>
          {session ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-[#4C5A50]">Logged in as</p>
                <p className="text-sm font-semibold text-[#16231C]">{session.company || session.name}</p>
              </div>
              <button
                onClick={async () => {
                const { logout } = await import('@/lib/website-api');
                await logout();
                window.location.href = '/';
              }}
                className="flex items-center gap-2 px-3 py-2 border-2 border-[#A13B2E] text-[#A13B2E] hover:bg-red-50 font-semibold rounded-lg transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth?redirect=/marketplace')}
              className="text-sm font-semibold text-[#1F4D3A] hover:text-[#f36b14] transition-colors"
            >
              Log in
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {productsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">Could not load ERP catalog</p>
              <p className="text-red-700 text-sm mt-1">{productsError}</p>
              <p className="text-red-600 text-xs mt-2">
                Check ERP_ORG_ID and ERP_API_BASE_URL in your environment.
              </p>
            </div>
            <button
              onClick={loadProducts}
              className="flex items-center gap-1 text-sm font-semibold text-[#1F4D3A] hover:text-[#f36b14]"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4C5A50]" size={20} />
            <input
              type="text"
              placeholder="Search products by name, category, or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#D7DCCE] rounded-lg bg-white text-[#16231C] placeholder-[#4C5A50] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeCat === cat
                    ? 'bg-[#f36b14] text-white shadow-md'
                    : 'bg-[#E8EBE1] text-[#16231C] hover:bg-[#D7DCCE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loadingProducts ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#D7DCCE] border-t-[#f36b14] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#4C5A50]">Loading products from ERP...</p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickQuote={() => openQuickQuote(product)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-[#D7DCCE]">
            <Package size={48} className="mx-auto mb-4 text-[#D7DCCE]" />
            <p className="text-[#4C5A50] font-medium">No products found matching your search.</p>
          </div>
        )}

        {lastQuotation && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-[#16231C] mb-4 flex items-center gap-2">
              <Truck size={24} color="#1F4D3A" />
              Latest Quotation
            </h2>
            <div className="bg-white rounded-lg border border-[#D7DCCE] p-6">
              <p className="font-semibold text-[#1F4D3A]">{lastQuotation.product}</p>
              <p className="text-sm text-[#4C5A50] mt-1">
                {lastQuotation.product} · Qty {lastQuotation.qty} · {lastQuotation.date}
              </p>
            </div>
          </div>
        )}
      </div>

      {panelProduct && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPanelProduct(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#D7DCCE] p-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#16231C]">
                {submitted ? 'Quotation Submitted' : `Quote: ${panelProduct.name}`}
              </h3>
              <button onClick={() => setPanelProduct(null)} className="text-[#4C5A50] hover:text-[#16231C]">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {submitted && lastQuotation ? (
                <div className="space-y-6">
                  <div className="bg-[#16231C] rounded-lg p-8 text-white text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-[#2E6650]" />
                    <p className="text-xs uppercase tracking-widest text-[#2E6650] mb-2 font-semibold">
                      ERP Quotation Created
                    </p>
                    <h2 className="text-2xl font-bold mb-2">{lastQuotation.product}</h2>
                    <p className="text-sm text-gray-300">Your request was sent to Lockseed Supplies ERP</p>
                  </div>
                  <button
                    onClick={() => setPanelProduct(null)}
                    className="w-full bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  <Field label="Organization / Name *">
                    <input
                      type="text"
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
                    />
                  </Field>

                  <Field label="Email *">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
                    />
                  </Field>

                  <Field label="Phone Number *">
                    <input
                      type="tel"
                      value={form.clientNumber}
                      onChange={(e) => setForm({ ...form, clientNumber: e.target.value })}
                      placeholder="0712345678"
                      className="w-full px-4 py-2 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
                    />
                  </Field>

                  <Field label="Delivery Location *">
                    <input
                      type="text"
                      value={form.clientLocation}
                      onChange={(e) => setForm({ ...form, clientLocation: e.target.value })}
                      placeholder="City, Country"
                      className="w-full px-4 py-2 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
                    />
                  </Field>

                  <Field label={`Quantity * (${formatPrice(panelProduct.unitPrice)} each)`}>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
                    />
                  </Field>

                  <Field label="Additional Notes">
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
                    />
                  </Field>

                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || submitting}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      isFormValid && !submitting
                        ? 'bg-[#f36b14] hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-[#E8EBE1] text-[#4C5A50] cursor-not-allowed'
                    }`}
                  >
                    {submitting ? 'Submitting to ERP...' : 'Submit Quote Request'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
