'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, ShieldCheck } from 'lucide-react';

export function SiteNav({
  onExplore,
}: {
  onExplore?: () => void;
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const explore = onExplore ?? (() => router.push('/marketplace'));
  const goHome = () => router.push('/');

  return (
    <>
      <div className="bg-[#16231C] text-white text-sm text-center py-2 px-4 relative z-40">
        <span className="font-medium">Now onboarding suppliers and healthcare partners</span>{' '}
        <button
          onClick={() => router.push('/become-a-supplier')}
          className="underline underline-offset-2 hover:text-[#f36b14] font-semibold transition"
        >
          Join the network
        </button>
      </div>

      <nav className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_24px_rgba(31,77,58,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button type="button" onClick={goHome} className="flex items-center gap-3">
              <img src="/logo.png" alt="Lockseed" className="h-10 w-auto" />
            </button>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => router.push('/auth')}
                className="text-sm font-medium text-[#4C5A50] hover:text-[#1F4D3A] transition px-2"
              >
                Log in
              </button>
              <button
                onClick={() => router.push('/become-a-supplier')}
                className={`text-sm font-semibold text-[#1F4D3A] bg-white/70 backdrop-blur border border-white/80 py-2.5 px-4 rounded-xl transition-all shadow-[4px_4px_12px_rgba(31,77,58,0.10),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_6px_rgba(31,77,58,0.12)_inset,-2px_-2px_6px_rgba(255,255,255,0.6)_inset] active:scale-[0.98] ${
                  pathname === '/become-a-supplier' ? 'ring-2 ring-[#1F4D3A]/20' : ''
                }`}
              >
                Become a Supplier
              </button>
              <button
                onClick={explore}
                className="bg-gradient-to-b from-[#fb8536] to-[#f36b14] text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_18px_rgba(243,107,20,0.35)] hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_10px_22px_rgba(243,107,20,0.45)] active:scale-[0.98]"
              >
                Explore the Platform
              </button>
            </div>

            <button
              className="md:hidden text-[#16231C]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white/80 backdrop-blur-2xl border-t border-white/60 p-4 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                router.push('/become-a-supplier');
              }}
              className="w-full flex items-center justify-center text-[#1F4D3A] bg-white/70 border border-white/80 font-semibold py-2.5 rounded-xl"
            >
              Become a Supplier
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/auth');
                }}
                className="flex-1 border-2 border-[#1F4D3A] text-[#1F4D3A] hover:bg-[#F1F3EC] font-semibold py-2.5 rounded-lg"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  explore();
                }}
                className="flex-1 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg"
              >
                Explore
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#16231C] text-white/70 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={22} color="#FCFCF9" />
              <span className="font-bold text-white">Lockseed</span>
            </div>
            <p className="text-sm">Africa&rsquo;s healthcare procurement infrastructure.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/platform" className="hover:text-white transition">
                  Capabilities
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-white transition">
                  How it works
                </a>
              </li>
              <li>
                <a href="/vision" className="hover:text-white transition">
                  Vision &amp; Mission
                </a>
              </li>
              <li>
                <a href="/suppliers" className="hover:text-white transition">
                  Supplier Network
                </a>
              </li>
              <li>
                <a href="/marketplace" className="hover:text-white transition">
                  Marketplace
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/stories" className="hover:text-white transition">
                  Customer stories
                </a>
              </li>
              <li>
                <a href="/become-a-supplier" className="hover:text-white transition">
                  Become a Supplier
                </a>
              </li>
              <li>
                <a href="/auth" className="hover:text-white transition">
                  Log in
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/resources" className="hover:text-white transition">
                  Library
                </a>
              </li>
              <li>
                <a href="/resources#templates" className="hover:text-white transition">
                  Templates
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-white/40">Privacy</span>
              </li>
              <li>
                <span className="text-white/40">Terms</span>
              </li>
              <li>
                <span className="text-white/40">Security</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm">
          <p>&copy; 2026 Lockseed. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export const glassCard =
  'bg-white/55 backdrop-blur-xl border border-white/70 shadow-[8px_8px_24px_rgba(31,77,58,0.10),-8px_-8px_20px_rgba(255,255,255,0.85)]';
export const glassCardHover =
  'hover:shadow-[10px_10px_28px_rgba(31,77,58,0.14),-10px_-10px_24px_rgba(255,255,255,0.9)] hover:-translate-y-0.5';
