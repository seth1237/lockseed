'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import ContentPageShell from '@/components/content-page-shell';
import { glassCard, glassCardHover } from '@/components/site-chrome';
import { manufacturers } from '@/lib/site-content';

export default function SuppliersPage() {
  const router = useRouter();

  return (
    <ContentPageShell
      eyebrow="Supplier network"
      title="Trusted manufacturers on the network"
      description="Direct access to verified manufacturers and their distribution partners — more are joining regularly."
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
        {manufacturers.map((name) => (
          <div
            key={name}
            className={`rounded-xl p-6 flex items-center justify-center text-center transition-all ${glassCard} ${glassCardHover}`}
          >
            <span className="font-bold text-[#16231C]">{name}</span>
          </div>
        ))}
      </div>

      <div className={`max-w-3xl mx-auto rounded-2xl p-8 text-center ${glassCard}`}>
        <div className="inline-flex items-center gap-2 text-[#1F4D3A] font-semibold mb-3">
          <ShieldCheck size={18} /> Verified onboarding
        </div>
        <p className="text-[#4C5A50] mb-6">
          Manufacturers and distributors apply with company details, product categories, and a
          documents checklist. Our team reviews each lead before activating a supplier on the
          network.
        </p>
        <button
          onClick={() => router.push('/become-a-supplier')}
          className="bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center gap-2"
        >
          Become a Supplier <ArrowRight size={18} />
        </button>
      </div>
    </ContentPageShell>
  );
}
