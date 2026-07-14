'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import ContentPageShell from '@/components/content-page-shell';
import { glassCard, glassCardHover } from '@/components/site-chrome';
import { workflowSteps } from '@/lib/site-content';

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <ContentPageShell
      eyebrow="How it works"
      title="One platform. Every procurement workflow."
      description="A single, ordered process — from discovery to a lasting supplier relationship."
    >
      <div className="max-w-3xl mx-auto space-y-4 mb-12">
        {workflowSteps.map((step, i) => (
          <div
            key={step}
            className={`rounded-xl p-5 flex items-center gap-5 transition-all ${glassCard} ${glassCardHover}`}
          >
            <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#1F4D3A] to-[#2E6650] text-white flex items-center justify-center text-sm font-bold">
              {i + 1}
            </span>
            <p className="text-[#16231C] font-medium">{step}</p>
          </div>
        ))}
      </div>

      <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/marketplace')}
          className="bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center justify-center gap-2"
        >
          Explore the Platform <ArrowRight size={18} />
        </button>
        <button
          onClick={() => router.push('/become-a-supplier')}
          className="border-2 border-[#1F4D3A] text-[#1F4D3A] font-semibold py-3 px-8 rounded-xl"
        >
          Become a Supplier
        </button>
      </div>
    </ContentPageShell>
  );
}
