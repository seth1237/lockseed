'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Zap,
  Globe,
  Users,
  TrendingUp,
  ArrowRight,
  Menu,
  X,
  MessageSquare,
  FileCheck,
  PackageCheck,
  Sparkles,
  Star,
  FileText,
  ShoppingBag,
  Package,
  Loader2,
  Quote,
} from 'lucide-react';
import { fetchProducts } from '@/lib/erp-api';
import { formatPrice } from '@/lib/erp/products';
import type { MarketplaceProduct } from '@/lib/erp/types';

export default function LandingPage({
  onExplore,
  onRequestQuote,
}: {
  onExplore: () => void;
  onRequestQuote?: () => void;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStory, setActiveStory] = useState(0);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const handleRequestQuote = onRequestQuote ?? (() => router.push('/marketplace'));

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((items) => {
        if (active) setProducts(items.slice(0, 6));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const goToProductQuote = (product: MarketplaceProduct) =>
    router.push(
      `/quote-request?productId=${encodeURIComponent(product.id)}&product=${encodeURIComponent(
        product.name
      )}&unitPrice=${product.unitPrice}`
    );

  const stories = [
    {
      name: 'Amara Osei',
      role: 'Procurement Lead',
      org: 'Nairobi General Hospital',
      quote:
        'Lockseed cut our sourcing time in half. We used to chase suppliers by email for days — now quotes come back the same afternoon.',
      stat: '48%',
      statLabel: 'Faster time-to-quote',
    },
    {
      name: 'Rahul Mehta',
      role: 'Supply Chain Manager',
      org: 'CrestCare Clinics',
      quote:
        'Every supplier on here is actually vetted. That single fact removed an entire layer of due diligence from our process.',
      stat: '3x',
      statLabel: 'More suppliers evaluated per RFQ',
    },
    {
      name: 'Elena Vasquez',
      role: 'Director of Operations',
      org: 'Meridian Health Network',
      quote:
        'Our team files a request, tracks it in one place, and never loses a thread in someone\u2019s inbox anymore.',
      stat: '100%',
      statLabel: 'Requests tracked in one ledger',
    },
  ];

  const partners = [
    'MedCare Global',
    'SafeGuard PPE',
    'PharmaTech India',
    'OxygenFlow Systems',
    'DiagnoLab Solutions',
    'DentalCraft Pro',
  ];

  // Shared glass / neumorphic tokens (kept as class strings so every card reads consistently)
  const glassCard =
    'bg-white/55 backdrop-blur-xl border border-white/70 shadow-[8px_8px_24px_rgba(31,77,58,0.10),-8px_-8px_20px_rgba(255,255,255,0.85)]';
  const glassCardHover =
    'hover:shadow-[10px_10px_28px_rgba(31,77,58,0.14),-10px_-10px_24px_rgba(255,255,255,0.9)] hover:-translate-y-0.5';
  const glassDark =
    'bg-white/10 backdrop-blur-xl border border-white/15 shadow-[6px_6px_20px_rgba(0,0,0,0.22),-4px_-4px_14px_rgba(255,255,255,0.05)_inset]';

  return (
    <div className="min-h-screen bg-[#FCFCF9] relative overflow-x-hidden">
      {/* Ambient background blobs — the glass has something to catch light off */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#f36b14]/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-[#1F4D3A]/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[380px] h-[380px] rounded-full bg-[#F2C879]/20 blur-[100px]" />
      </div>

      {/* Announcement bar */}
      <div className="bg-[#16231C] text-white text-sm text-center py-2 px-4 relative z-40">
        <span className="font-medium">New: instant quote matching is live</span>{' '}
        <button onClick={onExplore} className="underline underline-offset-2 hover:text-[#f36b14] font-semibold transition">
          Try it now
        </button>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_24px_rgba(31,77,58,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Lockseed Supply"
                className="h-10 w-auto"
              />
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-[#4C5A50] hover:text-[#1F4D3A] font-medium transition">
                Platform
              </a>
              <a href="#shop" className="text-sm text-[#4C5A50] hover:text-[#1F4D3A] font-medium transition">
                Shop Now
              </a>
              <a href="#benefits" className="text-sm text-[#4C5A50] hover:text-[#1F4D3A] font-medium transition">
                Why Lockseed
              </a>
              <a href="#suppliers" className="text-sm text-[#4C5A50] hover:text-[#1F4D3A] font-medium transition">
                Suppliers
              </a>
              <a href="#stories" className="text-sm text-[#4C5A50] hover:text-[#1F4D3A] font-medium transition">
                Customer stories
              </a>
              <a href="#resources" className="text-sm text-[#4C5A50] hover:text-[#1F4D3A] font-medium transition">
                Resources
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => router.push('/auth')}
                className="text-sm font-medium text-[#4C5A50] hover:text-[#1F4D3A] transition px-2"
              >
                Log in
              </button>
              <button
                onClick={handleRequestQuote}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#1F4D3A] bg-white/70 backdrop-blur border border-white/80 py-2.5 px-4 rounded-xl transition-all shadow-[4px_4px_12px_rgba(31,77,58,0.10),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_6px_rgba(31,77,58,0.12)_inset,-2px_-2px_6px_rgba(255,255,255,0.6)_inset] active:scale-[0.98]"
              >
                <FileText size={15} />
                Request a Quote
              </button>
              <button
                onClick={onExplore}
                className="bg-gradient-to-b from-[#fb8536] to-[#f36b14] text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_18px_rgba(243,107,20,0.35)] hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_10px_22px_rgba(243,107,20,0.45)] active:scale-[0.98]"
              >
                Start Shopping
              </button>
            </div>

            <button className="md:hidden text-[#16231C]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white/80 backdrop-blur-2xl border-t border-white/60 p-4 space-y-4">
            <a href="#features" className="block text-[#4C5A50] hover:text-[#1F4D3A] font-medium">Platform</a>
            <a href="#shop" className="block text-[#4C5A50] hover:text-[#1F4D3A] font-medium">Shop Now</a>
            <a href="#benefits" className="block text-[#4C5A50] hover:text-[#1F4D3A] font-medium">Why Lockseed</a>
            <a href="#suppliers" className="block text-[#4C5A50] hover:text-[#1F4D3A] font-medium">Suppliers</a>
            <a href="#stories" className="block text-[#4C5A50] hover:text-[#1F4D3A] font-medium">Customer stories</a>
            <a href="#resources" className="block text-[#4C5A50] hover:text-[#1F4D3A] font-medium">Resources</a>
            <button
              onClick={handleRequestQuote}
              className="w-full flex items-center justify-center gap-1.5 text-[#1F4D3A] bg-white/70 border border-white/80 font-semibold py-2.5 rounded-xl transition-all shadow-[4px_4px_12px_rgba(31,77,58,0.10),-4px_-4px_10px_rgba(255,255,255,0.9)]"
            >
              <FileText size={15} />
              Request a Quote
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/auth')}
                className="flex-1 border-2 border-[#1F4D3A] text-[#1F4D3A] hover:bg-[#F1F3EC] font-semibold py-2.5 rounded-lg transition-all"
              >
                Log in
              </button>
              <button
                onClick={onExplore}
                className="flex-1 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Start Shopping
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#16231C] leading-[1.1] mb-6 tracking-tight">
          Procurement + Trust:
          <br />
          Succeeding Together
        </h1>
        <p className="text-lg md:text-xl text-[#4C5A50] max-w-2xl mx-auto mb-8 leading-relaxed">
          Join 500+ healthcare organizations sourcing from verified medical suppliers, filing
          quotes, and tracking every order — all on one trusted platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <button
            onClick={onExplore}
            className="bg-gradient-to-b from-[#fb8536] to-[#f36b14] text-white font-semibold py-3 px-7 rounded-xl transition-all shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_10px_24px_rgba(243,107,20,0.35)] hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_12px_28px_rgba(243,107,20,0.45)] active:scale-[0.98]"
          >
            Start Shopping
          </button>
          <button
            onClick={handleRequestQuote}
            className="bg-white/60 backdrop-blur border border-white/80 text-[#16231C] font-semibold py-3 px-7 rounded-xl transition-all shadow-[6px_6px_16px_rgba(31,77,58,0.10),-6px_-6px_14px_rgba(255,255,255,0.9)] hover:shadow-[3px_3px_10px_rgba(31,77,58,0.12)_inset,-3px_-3px_10px_rgba(255,255,255,0.7)_inset]"
          >
            Take a tour
          </button>
        </div>

        {/* Trusted-by logo strip */}
        <p className="text-xs uppercase tracking-widest text-[#8B9689] mb-5">
          Trusted by procurement teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {partners.map((p) => (
            <span key={p} className="text-sm font-semibold text-[#4C5A50]">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Product screenshot placeholder */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className={`rounded-3xl overflow-hidden ${glassCard}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/40">
            <div className="bg-white/40 backdrop-blur-md p-6">
              <div className="w-10 h-10 rounded-xl bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-3">
                <ShieldCheck size={20} className="text-[#1F4D3A]" />
              </div>
              <h3 className="font-semibold text-[#16231C] mb-1">100% Verified Suppliers</h3>
              <p className="text-sm text-[#4C5A50]">Every supplier is thoroughly vetted before listing.</p>
            </div>
            <div className="bg-white/40 backdrop-blur-md p-6">
              <div className="w-10 h-10 rounded-xl bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-3">
                <Zap size={20} className="text-[#1F4D3A]" />
              </div>
              <h3 className="font-semibold text-[#16231C] mb-1">Lightning-fast RFQs</h3>
              <p className="text-sm text-[#4C5A50]">File a quote request in under 60 seconds.</p>
            </div>
            <div className="bg-white/40 backdrop-blur-md p-6">
              <div className="w-10 h-10 rounded-xl bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-3">
                <Globe size={20} className="text-[#1F4D3A]" />
              </div>
              <h3 className="font-semibold text-[#16231C] mb-1">Global Reach</h3>
              <p className="text-sm text-[#4C5A50]">Suppliers verified across 20+ countries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform overview - feature grid */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 bg-[#F1F3EC]/70 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-sm font-semibold text-[#1F4D3A] flex items-center gap-1">
              Platform overview <ArrowRight size={14} />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
              High-trust sourcing is built here
            </h2>
            <p className="text-lg text-[#4C5A50]">
              Lockseed is where procurement teams go daily to discover suppliers, request
              quotes, and keep every order moving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Discover', desc: 'Browse verified suppliers across 7 categories', icon: Globe },
              { num: '02', title: 'Request', desc: 'File a quote request in less than a minute', icon: CheckCircle2 },
              { num: '03', title: 'Track', desc: 'Monitor every request in your personal ledger', icon: TrendingUp },
              { num: '04', title: 'Receive', desc: 'Compare quotes and manage orders seamlessly', icon: Users },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-7 transition-all group ${glassCard} ${glassCardHover}`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold text-[#f36b14]">{step.num}</span>
                    <div className="w-9 h-9 rounded-lg bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center">
                      <Icon size={18} className="text-[#f36b14]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#16231C] mb-1.5">{step.title}</h3>
                  <p className="text-sm text-[#4C5A50]">{step.desc}</p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#f36b14] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shop Now — featured marketplace products */}
      <section id="shop" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold text-[#1F4D3A] flex items-center gap-1">
                <ShoppingBag size={14} /> Shop Now
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
                Featured products from verified suppliers
              </h2>
              <p className="text-lg text-[#4C5A50]">
                Live picks from the marketplace, pulled straight from our vetted supplier
                catalog. Add to a request or ask a supplier for pricing in one click.
              </p>
            </div>
            <button
              onClick={onExplore}
              className="shrink-0 self-start sm:self-auto inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-white/80 text-[#1F4D3A] font-semibold py-2.5 px-5 rounded-xl transition-all shadow-[4px_4px_12px_rgba(31,77,58,0.10),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_6px_rgba(31,77,58,0.12)_inset,-2px_-2px_6px_rgba(255,255,255,0.6)_inset]"
            >
              View all products <ArrowRight size={16} />
            </button>
          </div>

          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#1F4D3A]" />
            </div>
          ) : products.length === 0 ? (
            <div className={`rounded-2xl p-12 text-center ${glassCard}`}>
              <Package size={40} className="mx-auto text-[#8B9689] mb-4" />
              <p className="text-[#4C5A50] font-medium">No products available right now.</p>
              <button onClick={onExplore} className="mt-4 text-[#f36b14] font-semibold hover:underline">
                Browse the marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`rounded-2xl overflow-hidden flex flex-col transition-all ${glassCard} ${glassCardHover}`}
                >
                  <div className="h-44 bg-gradient-to-br from-[#F1F3EC] to-[#E8EBE1] overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23E8EBE1" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%234C5A50"%3EProduct Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/80 backdrop-blur text-[#1F4D3A] text-xs font-semibold px-2.5 py-1 rounded-full border border-white/80">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <span className="inline-block bg-white/70 text-[#1F4D3A] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/80 mb-2 self-start">
                      {product.category}
                    </span>
                    <h3 className="text-base font-bold text-[#16231C] mb-1 leading-snug">{product.name}</h3>
                    <p className="text-xs text-[#8B9689] mb-4 line-clamp-2">{product.description}</p>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-4 border-t border-white/60">
                      <div>
                        <p className="text-lg font-bold text-[#1F4D3A]">{formatPrice(product.unitPrice)}</p>
                        <p className="text-xs text-[#8B9689]">starting price</p>
                      </div>
                      <button
                        onClick={() => goToProductQuote(product)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-b from-[#fb8536] to-[#f36b14] py-2 px-4 rounded-lg transition-all shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_14px_rgba(243,107,20,0.35)] hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_18px_rgba(243,107,20,0.45)] active:scale-[0.98]"
                      >
                        <FileText size={14} />
                        Request Quote
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI-style spotlight feature */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-[#1F4D3A] flex items-center gap-1">
                <Sparkles size={14} /> Smart Matching
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
                Unblock sourcing with your personal matching engine
              </h2>
              <p className="text-lg text-[#4C5A50] mb-6">
                Smart Matching surfaces the right suppliers for every request automatically —
                ranked by certification, price history, and delivery reliability, so your team
                never starts from a blank search.
              </p>
              <ul className="space-y-2.5 mb-6">
                {['Certification-verified before they ever appear', 'Ranked by real price history, not list price', 'Scored on delivery reliability from past orders'].map(
                  (item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#4C5A50]">
                      <CheckCircle2 size={16} className="text-[#1F4D3A] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <a href="#" className="inline-flex items-center gap-1 text-[#1F4D3A] font-semibold hover:text-[#2E6650]">
                See how it works <ArrowRight size={16} />
              </a>
            </div>
            <div className={`relative rounded-3xl p-10 text-white bg-gradient-to-br from-[#1F4D3A] to-[#2E6650] overflow-hidden ${glassDark}`}>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#f36b14]/20 blur-3xl" />
              <div className="space-y-6 relative">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-[3px_3px_10px_rgba(0,0,0,0.2)_inset]">
                  <p className="text-sm text-white/70 mb-1">Matched suppliers</p>
                  <p className="text-3xl font-bold">6 found</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-[3px_3px_10px_rgba(0,0,0,0.2)_inset]">
                  <p className="text-sm text-white/70 mb-1">Avg. response time</p>
                  <p className="text-3xl font-bold">3.2 hrs</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-[3px_3px_10px_rgba(0,0,0,0.2)_inset]">
                  <p className="text-sm text-white/70 mb-1">Match confidence</p>
                  <p className="text-3xl font-bold">94%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Habits-style triple feature */}
      <section id="benefits" className="py-20 relative">
        <div className="absolute inset-0 bg-[#F1F3EC]/70 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-sm font-semibold text-[#1F4D3A]">Everyday trust</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
              Build reliable procurement through everyday habits
            </h2>
            <p className="text-lg text-[#4C5A50]">
              Turn daily moments — a quote request, a document check, a status update — into a
              supply chain your team can count on.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FileCheck,
                title: 'Verified Documents',
                desc: 'Every certification and compliance document is checked before a supplier goes live.',
                stat: '12,000+',
                statLabel: 'documents verified',
              },
              {
                icon: MessageSquare,
                title: 'Live Chat',
                desc: 'Message suppliers directly on a request thread instead of losing context in email.',
                stat: '3.2 hrs',
                statLabel: 'avg. reply time',
              },
              {
                icon: PackageCheck,
                title: 'Order Tracking',
                desc: 'Follow every order from confirmed quote to delivery, in one shared ledger.',
                stat: '100%',
                statLabel: 'orders tracked end-to-end',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`rounded-2xl p-7 transition-all ${glassCard} ${glassCardHover}`}>
                  <div className="w-11 h-11 bg-gradient-to-br from-[#1F4D3A] to-[#2E6650] rounded-lg flex items-center justify-center mb-5 shadow-[3px_3px_10px_rgba(31,77,58,0.3)]">
                    <Icon size={20} color="#FCFCF9" />
                  </div>
                  <h3 className="text-lg font-bold text-[#16231C] mb-1.5">{f.title}</h3>
                  <p className="text-sm text-[#4C5A50] mb-4">{f.desc}</p>
                  <div className="pt-3 border-t border-white/60">
                    <p className="text-xl font-bold text-[#1F4D3A]">{f.stat}</p>
                    <p className="text-xs text-[#8B9689]">{f.statLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer stories carousel */}
      <section id="stories" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[#1F4D3A]">Customer stories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3">
              Trusted by top procurement teams
            </h2>
          </div>

          <div className={`rounded-3xl p-8 md:p-12 ${glassCard}`}>
            <Quote size={32} className="text-[#f36b14]/40 mb-4" />
            <p className="text-xl md:text-2xl text-[#16231C] leading-relaxed mb-8">
              &ldquo;{stories[activeStory].quote}&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1F4D3A] to-[#2E6650] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {stories[activeStory].name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[#16231C]">{stories[activeStory].name}</p>
                  <p className="text-sm text-[#4C5A50]">
                    {stories[activeStory].role}, {stories[activeStory].org}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#1F4D3A]">{stories[activeStory].stat}</p>
                <p className="text-sm text-[#4C5A50]">{stories[activeStory].statLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStory(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeStory ? 'w-8 bg-[#1F4D3A]' : 'w-2 bg-[#D7DCCE]'
                }`}
                aria-label={`Show story ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Suppliers grid */}
      <section id="suppliers" className="py-20 relative">
        <div className="absolute inset-0 bg-[#F1F3EC]/70 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#1F4D3A]">Marketplace</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
              Our verified suppliers
            </h2>
            <p className="text-lg text-[#4C5A50] max-w-2xl mx-auto">
              Trusted partners from around the world, all vetted and rated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { name: 'MedCare Global', country: 'Germany', category: 'Surgical Instruments', rating: 4.8 },
              { name: 'SafeGuard PPE', country: 'USA', category: 'PPE & Protective', rating: 4.7 },
              { name: 'PharmaTech India', country: 'India', category: 'Pharmaceuticals & APIs', rating: 4.6 },
              { name: 'OxygenFlow Systems', country: 'Canada', category: 'Medical Oxygen', rating: 4.9 },
              { name: 'DiagnoLab Solutions', country: 'UK', category: 'Diagnostics & Lab', rating: 4.7 },
              { name: 'DentalCraft Pro', country: 'Italy', category: 'Dental Supplies', rating: 4.5 },
            ].map((supplier, i) => (
              <div key={i} className={`rounded-xl p-6 flex flex-col transition-all ${glassCard} ${glassCardHover}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} color="#1F4D3A" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">Verified</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#4C5A50]">
                    <Star size={12} className="text-[#f36b14]" fill="currentColor" />
                    {supplier.rating}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#16231C]">{supplier.name}</h3>
                <p className="text-sm text-[#4C5A50] mb-3">{supplier.country}</p>
                <span className="inline-block bg-white/70 text-[#1F4D3A] text-xs font-semibold px-3 py-1 rounded-full border border-white/80 mb-4 self-start">
                  {supplier.category}
                </span>
                <button
                  onClick={handleRequestQuote}
                  className="mt-auto w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#1F4D3A] bg-white/70 border border-white/80 py-2 rounded-lg transition-all shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_6px_rgba(31,77,58,0.12)_inset,-2px_-2px_6px_rgba(255,255,255,0.6)_inset]"
                >
                  <FileText size={14} />
                  Request Quote
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onExplore}
              className="bg-gradient-to-b from-[#fb8536] to-[#f36b14] text-white font-semibold py-3 px-8 rounded-xl transition-all inline-flex items-center gap-2 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_10px_24px_rgba(243,107,20,0.35)] hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_12px_28px_rgba(243,107,20,0.45)]"
            >
              Explore all suppliers <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-[#1F4D3A]">Resources</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3">
              Power your procurement team
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Sourcing Library', desc: 'Guides and checklists for medical procurement.', icon: FileCheck },
              { title: 'RFQ Templates', desc: 'Ready-to-use templates for common categories.', icon: FileText },
              { title: 'Community', desc: 'Connect with peers in healthcare procurement.', icon: Users },
              { title: 'Webinars', desc: 'Live and on-demand sessions with experts.', icon: MessageSquare },
            ].map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className={`rounded-xl p-6 transition-all ${glassCard} ${glassCardHover}`}>
                  <div className="w-9 h-9 rounded-lg bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-4">
                    <Icon size={18} className="text-[#1F4D3A]" />
                  </div>
                  <h3 className="font-bold text-[#16231C] mb-1.5">{r.title}</h3>
                  <p className="text-sm text-[#4C5A50] mb-3">{r.desc}</p>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F4D3A]">
                    Explore <ArrowRight size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA with rating badge */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4D3A] to-[#2E6650] -z-10" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#f36b14]/20 blur-[100px] -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 mb-6">
            <div className="flex text-[#F2C879]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <span className="text-sm font-medium">4.8/5 from 1,200+ verified reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#4ADE80]">
            Your suppliers are your business
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Make sure both are successful with Lockseed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRequestQuote}
              className="bg-white text-[#1F4D3A] hover:bg-[#F1F3EC] font-semibold py-3 px-8 rounded-xl transition-all shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
            >
              Request a demo
            </button>
            <button className="bg-white/10 backdrop-blur border border-white/30 hover:border-white/60 text-white font-semibold py-3 px-8 rounded-xl transition-all">
              Take a free tour
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16231C] text-white/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={22} color="#FCFCF9" />
                <span className="font-bold text-white">Lockseed</span>
              </div>
              <p className="text-sm">Verified medical supplier marketplace.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Overview</a></li>
                <li><a href="#shop" className="hover:text-white transition">Shop Now</a></li>
                <li><a href="#benefits" className="hover:text-white transition">Everyday trust</a></li>
                <li><a href="#suppliers" className="hover:text-white transition">Suppliers</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Newsroom</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#resources" className="hover:text-white transition">Library</a></li>
                <li><a href="#" className="hover:text-white transition">Templates</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
                <li><a href="#" className="hover:text-white transition">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm">
            <p>&copy; 2026 Lockseed Supplies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}