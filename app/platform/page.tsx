'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import ContentPageShell from '@/components/content-page-shell';
import { glassCard, glassCardHover } from '@/components/site-chrome';
import { capabilities, servicePillars, platformValueProps } from '@/lib/site-content';

export default function PlatformPage() {
  const router = useRouter();

  return (
    <ContentPageShell
      eyebrow="Platform"
      title="Africa’s Healthcare Procurement Infrastructure"
      description="One enterprise platform to source verified products, request quotations, access financing partners, run LockseedX inventory, and match suppliers with AI."
    >
      <div className={`max-w-4xl mx-auto rounded-2xl p-8 mb-14 ${glassCard}`}>
        <h2 className="text-lg font-bold text-[#16231C] mb-4">Built for healthcare across Africa</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {platformValueProps.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#4C5A50]">
              <CheckCircle2 size={16} className="text-[#1F4D3A] mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-end justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold text-[#16231C]">Capabilities</h2>
        <button
          onClick={() => router.push('/services')}
          className="text-sm font-semibold text-[#1F4D3A] inline-flex items-center gap-1"
        >
          View services <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {capabilities.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className={`rounded-2xl p-6 transition-all ${glassCard} ${glassCardHover}`}>
              <div className="w-10 h-10 rounded-lg bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#f36b14]" />
              </div>
              <h3 className="text-base font-bold text-[#16231C] mb-1.5">{c.title}</h3>
              <p className="text-sm text-[#4C5A50]">{c.desc}</p>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold text-[#16231C] mb-8">Service pillars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicePillars.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.id}
              href={`/services#${p.id}`}
              className={`rounded-2xl p-6 block transition-all ${glassCard} ${glassCardHover}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon size={18} className="text-[#f36b14]" />
                <h3 className="font-bold text-[#16231C]">{p.title}</h3>
              </div>
              <p className="text-sm text-[#4C5A50] line-clamp-3">{p.intro}</p>
            </a>
          );
        })}
      </div>
    </ContentPageShell>
  );
}
