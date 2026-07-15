'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Sparkles,
  Quote,
  PackageCheck,
  FileCheck,
  MessageSquare,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { SiteNav, SiteFooter, glassCard, glassCardHover } from '@/components/site-chrome';
import {
  manufacturers,
  capabilities,
  stories,
  servicePillars,
  platformValueProps,
  brandLogoUrl,
} from '@/lib/site-content';
import {
  fetchTopProducts,
  recordProductClick,
  type TopProduct,
} from '@/lib/website-api';
import { fetchProducts } from '@/lib/erp-api';
import { formatPrice } from '@/lib/erp/products';

export default function LandingPage({
  onExplore,
  onRequestQuote,
}: {
  onExplore: () => void;
  onRequestQuote?: () => void;
}) {
  const router = useRouter();
  const [activeStory, setActiveStory] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topLoading, setTopLoading] = useState(true);
  const handleRequestDemo = onRequestQuote ?? (() => router.push('/marketplace'));

  const glassDark =
    'bg-white/10 backdrop-blur-xl border border-white/15 shadow-[6px_6px_20px_rgba(0,0,0,0.22),-4px_-4px_14px_rgba(255,255,255,0.05)_inset]';

  useEffect(() => {
    let active = true;
    async function loadTop() {
      setTopLoading(true);
      try {
        let top = await fetchTopProducts(6);
        // Fallback: if no click data yet, seed from live catalog so the section is never empty.
        if (top.length === 0) {
          const catalog = await fetchProducts().catch(() => []);
          top = catalog.slice(0, 6).map((p) => ({
            id: p.id,
            name: p.name,
            image: p.image,
            unitPrice: p.unitPrice,
            category: p.category,
            clicks: 0,
          }));
        }
        if (active) setTopProducts(top);
      } finally {
        if (active) setTopLoading(false);
      }
    }
    loadTop();
    return () => {
      active = false;
    };
  }, []);

  const openProduct = (p: TopProduct) => {
    void recordProductClick({
      productId: p.id,
      productName: p.name,
      image: p.image,
      unitPrice: p.unitPrice,
      category: p.category,
    });
    onExplore();
  };

  return (
    <div className="min-h-screen bg-[#FCFCF9] relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#f36b14]/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-[#1F4D3A]/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[380px] h-[380px] rounded-full bg-[#F2C879]/20 blur-[100px]" />
      </div>

      <SiteNav onExplore={onExplore} />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#16231C] leading-[1.1] mb-6 tracking-tight">
          Building Africa&rsquo;s
          <br />
          Healthcare Procurement Infrastructure
        </h1>
        <p className="text-lg md:text-xl text-[#4C5A50] max-w-2xl mx-auto mb-8 leading-relaxed">
          A modern enterprise procurement platform for healthcare across Africa — source verified
          products and APIs, request quotations, access financing partners, run LockseedX, and match
          suppliers with AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            onClick={onExplore}
            className="bg-gradient-to-b from-[#fb8536] to-[#f36b14] text-white font-semibold py-3 px-7 rounded-xl transition-all shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_10px_24px_rgba(243,107,20,0.35)] hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_12px_28px_rgba(243,107,20,0.45)] active:scale-[0.98]"
          >
            Explore Products
          </button>
          <button
            onClick={() => router.push('/services')}
            className="bg-white/60 backdrop-blur border border-white/80 text-[#16231C] font-semibold py-3 px-7 rounded-xl"
          >
            View Services
          </button>
          <button
            onClick={() => router.push('/become-a-supplier')}
            className="border-2 border-[#1F4D3A] text-[#1F4D3A] font-semibold py-3 px-7 rounded-xl transition-all hover:bg-[#1F4D3A] hover:text-white active:scale-[0.98]"
          >
            Become a Supplier
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#4C5A50] max-w-3xl mx-auto mb-10">
          {platformValueProps.slice(0, 4).map((v) => (
            <span key={v} className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#1F4D3A] shrink-0" />
              {v.replace(/\.$/, '')}
            </span>
          ))}
        </div>

        <p className="text-xs uppercase tracking-widest text-[#8B9689] mb-5">Partner brands</p>
        <div className="flex flex-wrap items-center justify-center gap-3 opacity-90">
          {manufacturers.slice(0, 12).map((m) => (
            <div
              key={m.name}
              className="h-10 px-3 rounded-lg bg-white/70 border border-white/80 flex items-center gap-2 shadow-sm"
              title={m.name}
            >
              <img
                src={brandLogoUrl(m.domain)}
                alt=""
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xs font-semibold text-[#4C5A50] whitespace-nowrap">{m.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Infrastructure claim strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className={`rounded-3xl overflow-hidden ${glassCard}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/40">
            <div className="bg-white/40 backdrop-blur-md p-6">
              <div className="w-10 h-10 rounded-xl bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-3">
                <ShieldCheck size={20} className="text-[#1F4D3A]" />
              </div>
              <h3 className="font-semibold text-[#16231C] mb-1">Verified Network</h3>
              <p className="text-sm text-[#4C5A50]">
                Every supplier is vetted for certification and compliance before listing.
              </p>
            </div>
            <div className="bg-white/40 backdrop-blur-md p-6">
              <div className="w-10 h-10 rounded-xl bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-3">
                <Zap size={20} className="text-[#1F4D3A]" />
              </div>
              <h3 className="font-semibold text-[#16231C] mb-1">Digital Procurement</h3>
              <p className="text-sm text-[#4C5A50]">
                RFQs, approvals, and order tracking, without email threads or paper trails.
              </p>
            </div>
            <div className="bg-white/40 backdrop-blur-md p-6">
              <div className="w-10 h-10 rounded-xl bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-3">
                <Globe size={20} className="text-[#1F4D3A]" />
              </div>
              <h3 className="font-semibold text-[#16231C] mb-1">Cross-border Access</h3>
              <p className="text-sm text-[#4C5A50]">
                Healthcare providers reach manufacturers and distributors beyond their local
                market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Products — dynamically ranked by clicks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-semibold text-[#1F4D3A]">Top products</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#16231C] mt-2">
              Products you love most!
                          </h2>
          </div>
          <button
            onClick={onExplore}
            className="shrink-0 inline-flex items-center gap-2 text-[#1F4D3A] font-semibold hover:text-[#2E6650]"
          >
            See more <ArrowRight size={16} />
          </button>
        </div>

        {topLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#D7DCCE] border-t-[#f36b14] rounded-full animate-spin" />
          </div>
        ) : topProducts.length === 0 ? (
          <div className={`rounded-2xl p-10 text-center ${glassCard}`}>
            <Package size={36} className="mx-auto text-[#8B9689] mb-3" />
            <p className="text-[#4C5A50]">Products will appear here as buyers explore the catalog.</p>
            <button onClick={onExplore} className="mt-4 text-[#f36b14] font-semibold">
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openProduct(p)}
                className={`text-left rounded-2xl overflow-hidden transition-all ${glassCard} ${glassCardHover}`}
              >
                <div className="h-40 bg-gradient-to-br from-[#F1F3EC] to-[#E8EBE1] overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-[#1F4D3A]">{p.category}</span>
                  <h3 className="font-bold text-[#16231C] mt-1 line-clamp-2">{p.name}</h3>
                  <p className="text-sm font-semibold text-[#f36b14] mt-2">
                    {formatPrice(p.unitPrice)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={onExplore}
            className="bg-gradient-to-b from-[#fb8536] to-[#f36b14] text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center gap-2"
          >
            See more products <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[#F1F3EC]/70 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold text-[#1F4D3A]">Services</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
                Digital health, financing partners, quality &amp; after-sales
              </h2>
              <p className="text-lg text-[#4C5A50]">
                LockseedX inventory software, financing through trusted partners, regulatory
                support, and biomedical after-sales — built for healthcare operations.
              </p>
            </div>
            <button
              onClick={() => router.push('/services')}
              className="shrink-0 inline-flex items-center gap-2 text-[#1F4D3A] font-semibold"
            >
              All services <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servicePillars.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => router.push(`/services#${p.id}`)}
                  className={`text-left rounded-2xl p-7 transition-all ${glassCard} ${glassCardHover}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center">
                      <Icon size={18} className="text-[#f36b14]" />
                    </div>
                    <h3 className="font-bold text-[#16231C]">{p.title}</h3>
                  </div>
                  <p className="text-sm text-[#4C5A50] line-clamp-3">{p.intro}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold text-[#1F4D3A]">Platform capabilities</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
                Everything healthcare procurement needs
              </h2>
            </div>
            <button
              onClick={() => router.push('/platform')}
              className="shrink-0 inline-flex items-center gap-2 text-[#1F4D3A] font-semibold hover:text-[#2E6650]"
            >
              View all capabilities <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.slice(0, 6).map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className={`rounded-2xl p-6 transition-all ${glassCard} ${glassCardHover}`}>
                  <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-[#f36b14]" />
                  </div>
                  <h3 className="text-base font-bold text-[#16231C] mb-1.5">{c.title}</h3>
                  <p className="text-sm text-[#4C5A50]">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Smart Matching */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[#F1F3EC]/70 backdrop-blur-sm -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-[#1F4D3A] flex items-center gap-1">
                <Sparkles size={14} /> AI-powered Smart Matching
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
                Every RFQ is routed by data, not by who a buyer already knows
              </h2>
              <p className="text-lg text-[#4C5A50] mb-6">
                Smart Matching surfaces the right suppliers for every request automatically —
                ranked by certification, price history, and delivery reliability.
              </p>
              <button
                onClick={() => router.push('/how-it-works')}
                className="inline-flex items-center gap-1 text-[#1F4D3A] font-semibold hover:text-[#2E6650]"
              >
                See how the platform works <ArrowRight size={16} />
              </button>
            </div>
            <div
              className={`relative rounded-3xl p-10 text-white bg-gradient-to-br from-[#1F4D3A] to-[#2E6650] overflow-hidden ${glassDark}`}
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#f36b14]/20 blur-3xl" />
              <div className="space-y-4 relative">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
                  <p className="text-sm text-white/70 mb-3">Matching in progress</p>
                  <svg viewBox="0 0 300 150" className="w-full h-36" fill="none">
                    <line x1="34" y1="75" x2="262" y2="30" stroke="white" strokeOpacity="0.18" strokeWidth="2" />
                    <line x1="34" y1="75" x2="262" y2="75" stroke="white" strokeOpacity="0.18" strokeWidth="2" />
                    <line x1="34" y1="75" x2="262" y2="120" stroke="white" strokeOpacity="0.18" strokeWidth="2" />
                    <circle r="4" fill="#4ADE80">
                      <animateMotion dur="1.8s" repeatCount="indefinite" path="M34,75 L262,75" />
                    </circle>
                    <circle cx="34" cy="75" r="18" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
                    <text x="34" y="79" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
                      RFQ
                    </text>
                    <circle cx="262" cy="30" r="13" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" />
                    <circle cx="262" cy="120" r="13" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.3" />
                    <circle cx="262" cy="75" r="13" fill="#4ADE80" fillOpacity="0.9" />
                  </svg>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-1">Best match found</p>
                    <p className="text-xl font-bold">Supplier verified &amp; ranked #1</p>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-[#4ADE80] animate-pulse shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner brands full grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[#1F4D3A]">Partner brands</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
              Manufacturers &amp; suppliers on the network
            </h2>
            <p className="text-lg text-[#4C5A50] max-w-2xl mx-auto">
              Discover products across major healthcare brands — more partners join regularly.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {manufacturers.map((m) => (
              <div
                key={m.name}
                className={`rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[88px] ${glassCard} ${glassCardHover}`}
              >
                <img
                  src={brandLogoUrl(m.domain)}
                  alt={m.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
                <span className="text-xs font-bold text-[#16231C] leading-tight">{m.name}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => router.push('/suppliers')}
              className="inline-flex items-center gap-2 text-[#1F4D3A] font-semibold"
            >
              View supplier network <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Trust + story preview */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-[#F1F3EC]/70 backdrop-blur-sm -z-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              {
                icon: FileCheck,
                title: 'Verified Documentation',
                desc: 'Certifications checked before a supplier goes live.',
              },
              {
                icon: MessageSquare,
                title: 'Direct Communication',
                desc: 'Request threads keep context in one place.',
              },
              {
                icon: PackageCheck,
                title: 'Order Tracking',
                desc: 'Follow every order from quote to delivery.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={`rounded-2xl p-7 ${glassCard}`}>
                  <div className="w-11 h-11 bg-gradient-to-br from-[#1F4D3A] to-[#2E6650] rounded-lg flex items-center justify-center mb-5">
                    <Icon size={20} color="#FCFCF9" />
                  </div>
                  <h3 className="text-lg font-bold text-[#16231C] mb-1.5">{f.title}</h3>
                  <p className="text-sm text-[#4C5A50]">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <div className={`rounded-3xl p-8 md:p-12 ${glassCard}`}>
            <Quote size={32} className="text-[#f36b14]/40 mb-4" />
            <p className="text-xl md:text-2xl text-[#16231C] leading-relaxed mb-8">
              &ldquo;{stories[activeStory].quote}&rdquo;
            </p>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="font-semibold text-[#16231C]">{stories[activeStory].name}</p>
                <p className="text-sm text-[#4C5A50]">
                  {stories[activeStory].role}, {stories[activeStory].org}
                </p>
              </div>
              <button
                onClick={() => router.push('/stories')}
                className="text-sm font-semibold text-[#1F4D3A] inline-flex items-center gap-1"
              >
                More stories <ArrowRight size={14} />
              </button>
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

      {/* Supplier CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#16231C] mb-4">
            Join the verified supplier network
          </h2>
          <p className="text-lg text-[#4C5A50] mb-8">
            Manufacturers and distributors can apply to sell through Lockseed. Tell us what you
            supply — our team reviews each application.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/become-a-supplier')}
              className="bg-gradient-to-b from-[#fb8536] to-[#f36b14] text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center justify-center gap-2"
            >
              Become a Supplier <ArrowRight size={18} />
            </button>
            <button
              onClick={() => router.push('/suppliers')}
              className="border-2 border-[#1F4D3A] text-[#1F4D3A] font-semibold py-3 px-8 rounded-xl"
            >
              View supplier network
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {/* <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F4D3A] to-[#2E6650] -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRequestDemo}
              className="bg-white text-[#1F4D3A] hover:bg-[#F1F3EC] font-semibold py-3 px-8 rounded-xl"
            >
              Explore Products
            </button>
            <button
              onClick={() => router.push('/services')}
              className="bg-white/10 border border-white/30 hover:border-white/60 text-white font-semibold py-3 px-8 rounded-xl"
            >
              View Services
            </button>
          </div>
        </div>
      </section> */}

      <SiteFooter />
    </div>
  );
}
