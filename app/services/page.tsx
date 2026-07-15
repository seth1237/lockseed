'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import ContentPageShell from '@/components/content-page-shell';
import { glassCard, glassCardHover } from '@/components/site-chrome';
import { servicePillars, platformValueProps } from '@/lib/site-content';

export default function ServicesPage() {
  const router = useRouter();

  return (
    <ContentPageShell
      eyebrow="Services"
      title="Healthcare procurement infrastructure, end to end"
      description="Beyond a marketplace — Lockseed Supply helps African healthcare providers source, finance, comply, and manage after delivery."
    >
      <div className={`max-w-4xl mx-auto rounded-2xl p-8 mb-14 ${glassCard}`}>
        <h2 className="text-lg font-bold text-[#16231C] mb-4">What customers can do on Lockseed</h2>
        <ul className="space-y-2.5">
          {platformValueProps.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#4C5A50]">
              <CheckCircle2 size={16} className="text-[#1F4D3A] mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-10">
        {servicePillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <section
              key={pillar.id}
              id={pillar.id}
              className={`rounded-2xl p-8 scroll-mt-28 ${glassCard}`}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#f36b14]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#16231C]">{pillar.title}</h2>
                  <p className="text-sm text-[#4C5A50] mt-2 leading-relaxed">{pillar.intro}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                {pillar.items.map((item) => (
                  <div
                    key={item.name}
                    className={`rounded-xl p-4 border border-white/70 bg-white/50 ${glassCardHover}`}
                  >
                    <p className="font-semibold text-[#16231C] text-sm">{item.name}</p>
                    {item.desc ? (
                      <p className="text-xs text-[#4C5A50] mt-1">{item.desc}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="text-center mt-14 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/marketplace')}
          className="bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center justify-center gap-2"
        >
          Browse products <ArrowRight size={18} />
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
