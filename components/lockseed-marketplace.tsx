'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  Package,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  LogOut,
  ShoppingCart,
  Check,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { getMe, recordProductClick } from '@/lib/website-api';
import type { WebsiteUser } from '@/lib/website-api';
import { fetchProducts } from '@/lib/erp-api';
import type { MarketplaceProduct } from '@/lib/erp/types';
import { formatPrice } from '@/lib/erp/products';
import {
  addToQuoteCart,
  getQuoteCartCount,
} from '@/lib/quote-cart';

const PAGE_SIZE = 9;

type SortOption = 'default' | 'name-asc' | 'price-asc' | 'price-desc';

const SORT_LABELS: Record<SortOption, string> = {
  default: 'Featured',
  'name-asc': 'Name (A–Z)',
  'price-asc': 'Price (Low to High)',
  'price-desc': 'Price (High to Low)',
};

function VerifiedSeal({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 40 : 60;
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: sz, height: sz }}>
      <ShieldCheck width={sz * 0.7} height={sz * 0.7} color="#1F4D3A" fill="#1F4D3A" />
    </div>
  );
}

function ProductCard({
  product,
  onAdded,
  onRequestQuote,
}: {
  product: MarketplaceProduct;
  onAdded: () => void;
  onRequestQuote: () => void;
}) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    void recordProductClick({
      productId: product.id,
      productName: product.name,
      image: product.image,
      unitPrice: product.unitPrice,
      category: product.category,
    });
    addToQuoteCart({
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: 1,
    });
    setJustAdded(true);
    onAdded();
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="bg-white border border-[#D7DCCE] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="h-40 sm:h-48 bg-gradient-to-br from-[#F1F3EC] to-[#E8EBE1] overflow-hidden relative">
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

      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <span className="inline-block bg-[#F1F3EC] text-[#1F4D3A] text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
              {product.category}
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-[#16231C] leading-snug">
              {product.name}
            </h3>
          </div>
          <VerifiedSeal size="sm" />
        </div>

        <p className="text-sm text-[#4C5A50] mb-4 line-clamp-2 flex-1">{product.description}</p>

        <div className="space-y-2 text-xs mb-5 border-t border-[#D7DCCE] pt-4">
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

        <div className="space-y-2.5 mt-auto">
          <button
            onClick={onRequestQuote}
            className="w-full bg-[#f36b14] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            Request Quote
          </button>
          <button
            onClick={handleAdd}
            className="w-full border-2 border-[#2E6650] text-[#2E6650] hover:bg-[#F1F3EC] active:bg-[#E8EBE1] font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {justAdded ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Add to quote
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LockseedMarketplace() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [session, setSession] = useState<WebsiteUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const refreshCart = () => setCartCount(getQuoteCartCount());

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
      } catch {
        setSession(null);
      }
    }

    loadProducts();
    loadSession();
    refreshCart();

    const onCart = () => refreshCart();
    window.addEventListener('lockseed-quote-cart', onCart);
    window.addEventListener('storage', onCart);
    return () => {
      window.removeEventListener('lockseed-quote-cart', onCart);
      window.removeEventListener('storage', onCart);
    };
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return ['All', ...cats];
  }, [products]);

  // Reset pagination whenever the active filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCat, query, sortBy]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchCat = activeCat === 'All' || product.category === activeCat;
      const matchQuery =
        !query ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.unitPrice - a.unitPrice);
        break;
      default:
        // Featured: group by category, alphabetical within each category
        sorted.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category);
          return catCompare !== 0 ? catCompare : a.name.localeCompare(b.name);
        });
    }
    return sorted;
  }, [products, activeCat, query, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const startQuote = (product: MarketplaceProduct) => {
    void recordProductClick({
      productId: product.id,
      productName: product.name,
      image: product.image,
      unitPrice: product.unitPrice,
      category: product.category,
    });
    addToQuoteCart({
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: 1,
    });
    refreshCart();
    router.push('/quote-request');
  };

  return (
    <div className="min-h-screen bg-[#FCFCF9]">
      <header className="bg-white border-b border-[#D7DCCE] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => router.push(session ? '/auth' : '/')}
              className="flex items-center gap-2 text-[#1F4D3A] hover:text-[#f36b14] font-semibold transition-colors shrink-0 p-1 -ml-1"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <img src="/logo.png" alt="Lockseed Supply" className="h-8 sm:h-12 w-auto shrink-0" />
          </div>

          <p className="hidden md:block text-xs uppercase tracking-widest text-[#4C5A50] font-semibold text-center flex-1">
            {loadingProducts ? 'Loading catalog...' : `${products.length} Products`}
          </p>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => router.push('/quote-request')}
              className="relative inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 border-2 border-[#1F4D3A] text-[#1F4D3A] font-semibold rounded-lg hover:bg-[#F1F3EC]"
              aria-label="View quote cart"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline text-sm">Quote</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-[#f36b14] text-white text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            {session ? (
              <>
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-[#4C5A50]">Logged in as</p>
                  <p className="text-sm font-semibold text-[#16231C] truncate max-w-[10rem]">
                    {session.company || session.name}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const { logout } = await import('@/lib/website-api');
                    await logout();
                    window.location.href = '/';
                  }}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-2 border-2 border-[#A13B2E] text-[#A13B2E] hover:bg-red-50 font-semibold rounded-lg"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/auth?redirect=/marketplace')}
                className="text-sm font-semibold text-[#1F4D3A] hover:text-[#f36b14] whitespace-nowrap"
              >
                Log in
              </button>
            )}
          </div>
        </div>

        {/* Product count for mobile, shown under the main header row */}
        <div className="md:hidden px-3 pb-2 -mt-1">
          <p className="text-xs uppercase tracking-widest text-[#4C5A50] font-semibold">
            {loadingProducts ? 'Loading catalog...' : `${products.length} Products`}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {productsError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">Could not load ERP catalog</p>
              <p className="text-red-700 text-sm mt-1">{productsError}</p>
            </div>
            <button
              onClick={loadProducts}
              className="flex items-center gap-1 text-sm font-semibold text-[#1F4D3A] shrink-0"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <div className="relative mb-4 sm:mb-6">
            <Search size={18} className="absolute left-4 top-3.5 text-[#4C5A50]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 border-2 border-[#8B9689] rounded-lg bg-white text-[#16231C] placeholder:text-[#8B9689] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
            />
          </div>

          {/* Categories: horizontal scroll on mobile so the row never wraps awkwardly */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide flex-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    activeCat === cat
                      ? 'bg-[#1F4D3A] text-white'
                      : 'bg-white text-[#4C5A50] border border-[#D7DCCE] hover:border-[#1F4D3A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort control */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#4C5A50]">
              Showing <span className="font-semibold text-[#16231C]">{visibleProducts.length}</span> of{' '}
              <span className="font-semibold text-[#16231C]">{filteredProducts.length}</span>
            </p>
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen((open) => !open)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#1F4D3A] border border-[#D7DCCE] rounded-lg bg-white hover:border-[#1F4D3A]"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden xs:inline">Sort:</span>
                {SORT_LABELS[sortBy]}
                <ChevronDown size={14} />
              </button>
              {sortMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSortMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#D7DCCE] rounded-lg shadow-lg z-50 overflow-hidden">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setSortMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F1F3EC] transition-colors ${
                          sortBy === option ? 'text-[#1F4D3A] font-semibold bg-[#F1F3EC]' : 'text-[#16231C]'
                        }`}
                      >
                        {SORT_LABELS[option]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {loadingProducts ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#D7DCCE] border-t-[#f36b14] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#4C5A50]">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-[#D7DCCE]">
            <Package size={48} className="mx-auto mb-4 text-[#D7DCCE]" />
            <p className="text-[#4C5A50] font-medium">No products found matching your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdded={refreshCart}
                  onRequestQuote={() => startQuote(product)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8 sm:mt-10">
                <button
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="px-6 py-3 border-2 border-[#1F4D3A] text-[#1F4D3A] font-semibold rounded-lg hover:bg-[#1F4D3A] hover:text-white transition-colors"
                >
                  View more products
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
          <button
            onClick={() => router.push('/quote-request')}
            className="bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-3 px-4 sm:px-5 rounded-full shadow-lg inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <ShoppingCart size={18} />
            <span className="hidden xs:inline">Review quote</span> ({cartCount})
          </button>
        </div>
      )}
    </div>
  );
}