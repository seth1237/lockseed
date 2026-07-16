'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  Menu,
  X,
  Heart,
  LayoutDashboard,
  FileText,
  Truck,
  Users,
  Wrench,
  Layers,
  HelpCircle,
  Home,
  Download,
  LayoutGrid,
  Rows3,
  Info,
  Scale,
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
const MAX_COMPARE = 3;

type SortOption = 'default' | 'name-asc' | 'price-asc' | 'price-desc';
type ViewMode = 'grid' | 'list';

const SORT_LABELS: Record<SortOption, string> = {
  default: 'Featured',
  'name-asc': 'Name (A–Z)',
  'price-asc': 'Price (Low to High)',
  'price-desc': 'Price (High to Low)',
};

/** Sidebar links to real website modules (not placeholder routes). */
const NAV_ITEMS: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Dashboard', href: '/auth', icon: LayoutDashboard },
  { label: 'Products', href: '/marketplace', icon: Package },
  { label: 'RFQs', href: '/quote-request', icon: FileText },
  { label: 'Suppliers', href: '/suppliers', icon: Users },
  { label: 'Services', href: '/services', icon: Wrench },
  { label: 'Platform', href: '/platform', icon: Layers },
  { label: 'How it works', href: '/how-it-works', icon: HelpCircle },
];

function VerifiedSeal({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 40 : 60;
  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: sz, height: sz }}
      title="Verified supplier"
    >
      <ShieldCheck width={sz * 0.7} height={sz * 0.7} color="#1F4D3A" fill="#1F4D3A" />
    </div>
  );
}

function fallbackImage(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23E8EBE1" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%234C5A50"%3EProduct Image%3C/text%3E%3C/svg%3E';
}

/* ----------------------------------------------------------------------- */
/* Sidebar                                                                  */
/* ----------------------------------------------------------------------- */

function SidebarNav({
  open,
  onClose,
  onNavigate,
  activeHref,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  activeHref: string;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 shrink-0 h-dvh bg-white border-r border-[#D7DCCE] flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#D7DCCE] shrink-0">
          <button type="button" onClick={() => onNavigate('/')} className="text-left">
            <img src="/logo.png" alt="Lockseed Supply" className="h-8 w-auto" />
          </button>
          <button className="lg:hidden p-1 text-[#4C5A50]" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/marketplace'
                ? activeHref === '/marketplace'
                : activeHref === item.href || activeHref.startsWith(`${item.href}/`);
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#1F4D3A] text-white'
                    : 'text-[#3C4A40] hover:bg-[#F1F3EC]'
                }`}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-[#2E6650]'} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="m-3 p-4 rounded-xl bg-[#F1F3EC] border border-[#D7DCCE] shrink-0">
          <p className="text-sm font-semibold text-[#16231C] mb-1">Become a Supplier</p>
          <p className="text-xs text-[#4C5A50] mb-3">
            Join the verified manufacturer and distributor network.
          </p>
          <button
            onClick={() => onNavigate('/become-a-supplier')}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-[#f36b14] hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Apply now
          </button>
        </div>
      </aside>
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* Product card                                                            */
/* ----------------------------------------------------------------------- */

function ProductCard({
  product,
  view,
  wished,
  onToggleWish,
  compareChecked,
  compareDisabled,
  onToggleCompare,
  onAdded,
  onRequestQuote,
  onViewDetails,
}: {
  product: MarketplaceProduct;
  view: ViewMode;
  wished: boolean;
  onToggleWish: () => void;
  compareChecked: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
  onAdded: () => void;
  onRequestQuote: () => void;
  onViewDetails: () => void;
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

  const image = (
    <div
      className={`relative bg-gradient-to-br from-[#F1F3EC] to-[#E8EBE1] overflow-hidden shrink-0 ${
        view === 'list' ? 'w-40 sm:w-48 h-full rounded-lg' : 'h-40 sm:h-48 w-full'
      }`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover"
        onError={fallbackImage}
      />
      {!product.inStock && (
        <span className="absolute top-3 left-3 bg-[#A13B2E] text-white text-xs font-semibold px-2 py-1 rounded-full">
          Out of stock
        </span>
      )}
      <button
        onClick={onToggleWish}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
      >
        <Heart size={16} className={wished ? 'text-[#f36b14]' : 'text-[#4C5A50]'} fill={wished ? '#f36b14' : 'none'} />
      </button>
    </div>
  );

  const body = (
    <div className="p-4 sm:p-6 flex flex-col flex-1 min-w-0">
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

      <div className="space-y-2 text-xs mb-4 border-t border-[#D7DCCE] pt-4">
        <div className="flex justify-between text-[#16231C]">
          <span className="font-medium">From:</span>
          <span className="font-semibold text-[#f36b14]">{formatPrice(product.unitPrice)}</span>
        </div>
        {product.sku && (
          <div className="flex justify-between text-[#16231C]">
            <span className="font-medium">SKU:</span>
            <span>{product.sku}</span>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-[#4C5A50] mb-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={compareChecked}
          disabled={compareDisabled}
          onChange={onToggleCompare}
          className="accent-[#1F4D3A] w-3.5 h-3.5"
        />
        <Scale size={14} className={compareDisabled && !compareChecked ? 'opacity-40' : ''} />
        Compare
      </label>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={onViewDetails}
          className="w-full border-2 border-[#D7DCCE] text-[#16231C] hover:border-[#1F4D3A] font-semibold py-2.5 px-3 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 text-sm"
        >
          <Info size={15} />
          View Details
        </button>
        <button
          onClick={onRequestQuote}
          className="w-full bg-[#f36b14] hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2.5 px-3 rounded-lg transition-colors shadow-sm hover:shadow-md text-sm"
        >
          Request Quote
        </button>
      </div>
      <button
        onClick={handleAdd}
        className="w-full mt-2 border-2 border-[#2E6650] text-[#2E6650] hover:bg-[#F1F3EC] active:bg-[#E8EBE1] font-semibold py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2 text-sm"
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
  );

  if (view === 'list') {
    return (
      <div className="bg-white border border-[#D7DCCE] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-row h-full">
        {image}
        {body}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#D7DCCE] rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {image}
      {body}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Product details modal                                                   */
/* ----------------------------------------------------------------------- */

function ProductDetailsModal({
  product,
  onClose,
  onAdd,
  onRequestQuote,
}: {
  product: MarketplaceProduct;
  onClose: () => void;
  onAdd: () => void;
  onRequestQuote: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 sm:h-64 bg-gradient-to-br from-[#F1F3EC] to-[#E8EBE1]">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={fallbackImage} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
            aria-label="Close"
          >
            <X size={18} className="text-[#16231C]" />
          </button>
          {!product.inStock && (
            <span className="absolute top-3 left-3 bg-[#A13B2E] text-white text-xs font-semibold px-2 py-1 rounded-full">
              Out of stock
            </span>
          )}
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="inline-block bg-[#F1F3EC] text-[#1F4D3A] text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#16231C]">{product.name}</h2>
            </div>
            <VerifiedSeal />
          </div>

          <p className="text-sm sm:text-base text-[#4C5A50] mb-6">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="border border-[#D7DCCE] rounded-lg p-3">
              <p className="text-[#4C5A50] mb-1">Unit price</p>
              <p className="font-semibold text-[#f36b14] text-lg">{formatPrice(product.unitPrice)}</p>
            </div>
            {product.sku && (
              <div className="border border-[#D7DCCE] rounded-lg p-3">
                <p className="text-[#4C5A50] mb-1">SKU</p>
                <p className="font-semibold text-[#16231C]">{product.sku}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onAdd}
              className="flex-1 border-2 border-[#2E6650] text-[#2E6650] hover:bg-[#F1F3EC] font-semibold py-3 rounded-lg inline-flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} /> Add to quote
            </button>
            <button
              onClick={onRequestQuote}
              className="flex-1 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
            >
              Request Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Compare modal                                                           */
/* ----------------------------------------------------------------------- */

function CompareModal({
  products,
  onClose,
  onRemove,
  onRequestAll,
}: {
  products: MarketplaceProduct[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onRequestAll: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#16231C]">Compare products</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 text-[#4C5A50] hover:text-[#16231C]">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0,1fr))` }}>
          {products.map((p) => (
            <div key={p.id} className="border border-[#D7DCCE] rounded-lg overflow-hidden flex flex-col">
              <div className="h-28 bg-gradient-to-br from-[#F1F3EC] to-[#E8EBE1] relative">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={fallbackImage} />
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                  aria-label={`Remove ${p.name} from comparison`}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-3 flex-1 flex flex-col gap-2 text-sm">
                <p className="font-semibold text-[#16231C] leading-snug">{p.name}</p>
                <div className="flex justify-between text-xs text-[#4C5A50]">
                  <span>Category</span>
                  <span className="font-medium text-[#16231C] text-right">{p.category}</span>
                </div>
                <div className="flex justify-between text-xs text-[#4C5A50]">
                  <span>Price</span>
                  <span className="font-semibold text-[#f36b14]">{formatPrice(p.unitPrice)}</span>
                </div>
                {p.sku && (
                  <div className="flex justify-between text-xs text-[#4C5A50]">
                    <span>SKU</span>
                    <span className="font-medium text-[#16231C]">{p.sku}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#4C5A50]">
                  <span>Availability</span>
                  <span className={`font-medium ${p.inStock ? 'text-[#1F4D3A]' : 'text-[#A13B2E]'}`}>
                    {p.inStock ? 'In stock' : 'Out of stock'}
                  </span>
                </div>
                <p className="text-xs text-[#4C5A50] line-clamp-3">{p.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onRequestAll}
          className="w-full mt-6 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
        >
          Request quotes for all {products.length}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Page                                                                     */
/* ----------------------------------------------------------------------- */

export default function LockseedMarketplace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [session, setSession] = useState<WebsiteUser | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);

  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [detailsProduct, setDetailsProduct] = useState<MarketplaceProduct | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

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

  // Keyboard shortcut: ⌘K / Ctrl+K focuses search, mirroring the hint shown in the search field.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Initialize the price range filter once real bounds are known from the catalog.
  useEffect(() => {
    if (!products.length || priceInitialized) return;
    const prices = products.map((p) => p.unitPrice);
    const bounds: [number, number] = [Math.min(...prices), Math.max(...prices)];
    setPriceBounds(bounds);
    setPriceRange(bounds);
    setPriceInitialized(true);
  }, [products, priceInitialized]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(categoryCounts.keys()).sort();
  }, [categoryCounts]);

  const topCategories = useMemo(() => {
    return [...categories].sort((a, b) => (categoryCounts.get(b) || 0) - (categoryCounts.get(a) || 0)).slice(0, 5);
  }, [categories, categoryCounts]);

  // Reset pagination whenever the active filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCat, query, sortBy, inStockOnly, priceRange]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchCat = activeCat === 'All' || product.category === activeCat;
      const matchQuery =
        !query ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase());
      const matchStock = !inStockOnly || product.inStock;
      const matchPrice =
        !priceInitialized ||
        (product.unitPrice >= priceRange[0] && product.unitPrice <= priceRange[1]);
      return matchCat && matchQuery && matchStock && matchPrice;
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
  }, [products, activeCat, query, sortBy, inStockOnly, priceRange, priceInitialized]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const compareProducts = products.filter((p) => compareIds.includes(p.id));

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

  const requestAllCompared = () => {
    compareProducts.forEach((p) => {
      addToQuoteCart({
        productId: p.id,
        productName: p.name,
        unitPrice: p.unitPrice,
        quantity: 1,
      });
    });
    refreshCart();
    setCompareOpen(false);
    router.push('/quote-request');
  };

  const toggleWish = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const exportCsv = () => {
    const header = ['Name', 'Category', 'SKU', 'Unit Price', 'In Stock'];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.category,
      p.sku || '',
      String(p.unitPrice),
      p.inStock ? 'Yes' : 'No',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lockseed-products.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-dvh flex overflow-hidden bg-[#FCFCF9]">
      <SidebarNav
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeHref={pathname}
        onNavigate={(href) => {
          setSidebarOpen(false);
          if (href === pathname) return;
          router.push(href);
        }}
      />

      <div className="flex-1 min-w-0 flex flex-col h-dvh overflow-hidden">
        {/* Header stays fixed; only the product pane scrolls */}
        <header className="bg-white border-b border-[#D7DCCE] shrink-0 z-30">
          <div className="px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-[#1F4D3A]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => router.push(session ? '/auth' : '/')}
              className="hidden sm:flex items-center gap-2 text-[#1F4D3A] hover:text-[#f36b14] font-semibold transition-colors shrink-0 p-1"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="relative flex-1 max-w-xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4C5A50]" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories, SKUs..."
                className="w-full pl-11 pr-14 py-2.5 border border-[#D7DCCE] rounded-lg bg-[#FCFCF9] text-[#16231C] placeholder:text-[#8B9689] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A] text-sm"
              />
              <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#8B9689] border border-[#D7DCCE] rounded px-1.5 py-0.5">
                Ctrl K
              </kbd>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
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

              {wishlist.size > 0 && (
                <span className="relative hidden sm:inline-flex items-center justify-center w-9 h-9 border border-[#D7DCCE] rounded-lg text-[#4C5A50]">
                  <Heart size={16} />
                  <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-[#1F4D3A] text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlist.size}
                  </span>
                </span>
              )}

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
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 overflow-y-auto overscroll-contain">
          {/* Breadcrumb + title + actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-[#8B9689] mb-2">
                Home <span className="mx-1">/</span>{' '}
                <span className="text-[#4C5A50]">{activeCat === 'All' ? 'Products' : activeCat}</span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#16231C]">Products</h1>
              <p className="text-sm text-[#4C5A50] mt-1">
                Compare verified suppliers, get competitive quotes, and source with confidence.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-[#D7DCCE] text-[#16231C] font-semibold rounded-lg hover:border-[#1F4D3A] text-sm"
              >
                <Download size={15} />
                Export
              </button>
              <button
                onClick={() => compareIds.length > 0 && setCompareOpen(true)}
                disabled={compareIds.length === 0}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-[#D7DCCE] text-[#16231C] font-semibold rounded-lg hover:border-[#1F4D3A] text-sm disabled:opacity-40 disabled:hover:border-[#D7DCCE]"
              >
                <Scale size={15} />
                Compare {compareIds.length > 0 ? `(${compareIds.length})` : ''}
              </button>
              <button
                onClick={() => router.push('/quote-request')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F4D3A] hover:bg-[#173a2c] text-white font-semibold rounded-lg text-sm shadow-sm"
              >
                <ShoppingCart size={15} />
                Request Quote
              </button>
            </div>
          </div>

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

          {/* Quick filter chips + sort + view toggle */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide flex-1 min-w-0">
              <button
                onClick={() => setActiveCat('All')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  activeCat === 'All'
                    ? 'bg-[#1F4D3A] text-white'
                    : 'bg-white text-[#4C5A50] border border-[#D7DCCE] hover:border-[#1F4D3A]'
                }`}
              >
                All
              </button>
              {topCategories.map((cat) => (
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
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-white text-[#4C5A50] border border-[#D7DCCE] hover:border-[#1F4D3A] whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal size={14} />
                More Filters
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex border border-[#D7DCCE] rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#1F4D3A] text-white' : 'bg-white text-[#4C5A50]'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#1F4D3A] text-white' : 'bg-white text-[#4C5A50]'}`}
                >
                  <Rows3 size={16} />
                </button>
              </div>

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
                    <div className="fixed inset-0 z-40" onClick={() => setSortMenuOpen(false)} />
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

          <p className="text-sm text-[#4C5A50] mb-5">
            Showing <span className="font-semibold text-[#16231C]">{visibleProducts.length}</span> of{' '}
            <span className="font-semibold text-[#16231C]">{filteredProducts.length}</span>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 sm:gap-8">
            {/* Filter panel: static on desktop, drawer on mobile */}
            <FilterPanel
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              categories={categories}
              categoryCounts={categoryCounts}
              activeCat={activeCat}
              setActiveCat={setActiveCat}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              priceBounds={priceBounds}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />

            <div>
              {loadingProducts ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 border-4 border-[#D7DCCE] border-t-[#f36b14] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[#4C5A50]">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center border border-[#D7DCCE]">
                  <Package size={48} className="mx-auto mb-4 text-[#D7DCCE]" />
                  <p className="text-[#4C5A50] font-medium">No products found matching your filters.</p>
                </div>
              ) : (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                        : 'flex flex-col gap-4'
                    }
                  >
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        view={viewMode}
                        wished={wishlist.has(product.id)}
                        onToggleWish={() => toggleWish(product.id)}
                        compareChecked={compareIds.includes(product.id)}
                        compareDisabled={compareIds.length >= MAX_COMPARE}
                        onToggleCompare={() => toggleCompare(product.id)}
                        onAdded={refreshCart}
                        onRequestQuote={() => startQuote(product)}
                        onViewDetails={() => setDetailsProduct(product)}
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
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            {[
              { icon: ShieldCheck, title: 'Verified Suppliers', text: 'All suppliers are verified and quality assured' },
              { icon: Check, title: 'Secure Procurement', text: 'Safe, transparent, and compliant process' },
              { icon: Truck, title: 'Global Delivery', text: 'Reliable shipping to any destination' },
              { icon: HelpCircle, title: 'Dedicated Support', text: 'Our team is here to support you 24/7' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 bg-white border border-[#D7DCCE] rounded-lg p-4">
                <div className="w-9 h-9 rounded-full bg-[#F1F3EC] flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#1F4D3A]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#16231C]">{title}</p>
                  <p className="text-xs text-[#4C5A50] mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          onClose={() => setDetailsProduct(null)}
          onAdd={() => {
            addToQuoteCart({
              productId: detailsProduct.id,
              productName: detailsProduct.name,
              unitPrice: detailsProduct.unitPrice,
              quantity: 1,
            });
            void recordProductClick({
              productId: detailsProduct.id,
              productName: detailsProduct.name,
              image: detailsProduct.image,
              unitPrice: detailsProduct.unitPrice,
              category: detailsProduct.category,
            });
            refreshCart();
            setDetailsProduct(null);
          }}
          onRequestQuote={() => {
            startQuote(detailsProduct);
            setDetailsProduct(null);
          }}
        />
      )}

      {compareOpen && compareProducts.length > 0 && (
        <CompareModal
          products={compareProducts}
          onClose={() => setCompareOpen(false)}
          onRemove={(id) => setCompareIds((prev) => prev.filter((c) => c !== id))}
          onRequestAll={requestAllCompared}
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Filter panel                                                            */
/* ----------------------------------------------------------------------- */

function FilterPanel({
  open,
  onClose,
  categories,
  categoryCounts,
  activeCat,
  setActiveCat,
  inStockOnly,
  setInStockOnly,
  priceBounds,
  priceRange,
  setPriceRange,
}: {
  open: boolean;
  onClose: () => void;
  categories: string[];
  categoryCounts: Map<string, number>;
  activeCat: string;
  setActiveCat: (cat: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  priceBounds: [number, number];
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
}) {
  const totalCount = Array.from(categoryCounts.values()).reduce((a, b) => a + b, 0);

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[#16231C] mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setActiveCat('All')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
              activeCat === 'All' ? 'bg-[#F1F3EC] text-[#1F4D3A] font-semibold' : 'text-[#4C5A50] hover:bg-[#F1F3EC]'
            }`}
          >
            <span>All</span>
            <span className="text-xs">{totalCount}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                activeCat === cat ? 'bg-[#F1F3EC] text-[#1F4D3A] font-semibold' : 'text-[#4C5A50] hover:bg-[#F1F3EC]'
              }`}
            >
              <span className="truncate">{cat}</span>
              <span className="text-xs shrink-0 ml-2">{categoryCounts.get(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#D7DCCE] pt-5">
        <h3 className="text-sm font-semibold text-[#16231C] mb-3">Availability</h3>
        <label className="flex items-center gap-2 text-sm text-[#4C5A50] cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-[#1F4D3A] w-4 h-4"
          />
          In stock only
        </label>
      </div>

      {priceBounds[1] > priceBounds[0] && (
        <div className="border-t border-[#D7DCCE] pt-5">
          <h3 className="text-sm font-semibold text-[#16231C] mb-3">Price range</h3>
          <div className="flex items-center gap-2 text-xs text-[#4C5A50] mb-2">
            <span>{formatPrice(priceRange[0])}</span>
            <span>–</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <input
            type="range"
            min={priceBounds[0]}
            max={priceBounds[1]}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-[#1F4D3A]"
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: static panel */}
      <div className="hidden lg:block bg-white border border-[#D7DCCE] rounded-lg p-5 h-fit sticky top-4">
        {content}
      </div>

      {/* Mobile: drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[#16231C]">Filters</h2>
              <button onClick={onClose} aria-label="Close filters" className="p-1 text-[#4C5A50]">
                <X size={20} />
              </button>
            </div>
            {content}
            <button
              onClick={onClose}
              className="w-full mt-6 bg-[#1F4D3A] text-white font-semibold py-2.5 rounded-lg"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}