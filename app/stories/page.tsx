'use client';

import { Quote } from 'lucide-react';
import ContentPageShell from '@/components/content-page-shell';
import { glassCard } from '@/components/site-chrome';
import { stories } from '@/lib/site-content';

export default function StoriesPage() {
  return (
    <ContentPageShell
      eyebrow="Customer stories"
      title="Trusted by procurement teams"
      description="Real workflows from hospitals, clinics, and diagnostics providers using Lockseed."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {stories.map((s) => (
          <div key={s.name} className={`rounded-3xl p-8 md:p-10 ${glassCard}`}>
            <Quote size={28} className="text-[#f36b14]/40 mb-4" />
            <p className="text-xl text-[#16231C] leading-relaxed mb-6">&ldquo;{s.quote}&rdquo;</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#16231C]">{s.name}</p>
                <p className="text-sm text-[#4C5A50]">
                  {s.role}, {s.org}
                </p>
              </div>
              <span className="inline-flex items-center bg-white/70 text-[#1F4D3A] text-sm font-semibold px-3 py-1.5 rounded-full border border-white/80">
                {s.outcome}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ContentPageShell>
  );
}
