'use client';

import { CheckCircle2 } from 'lucide-react';
import ContentPageShell from '@/components/content-page-shell';
import { glassCard } from '@/components/site-chrome';
import { platformValueProps } from '@/lib/site-content';

export default function VisionPage() {
  return (
    <ContentPageShell
      eyebrow="Our direction"
      title="Africa’s Healthcare Procurement Infrastructure"
      description="Beyond a simple marketplace — Lockseed Supply is the enterprise platform built for healthcare procurement across Africa."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
        <div className={`rounded-2xl p-8 ${glassCard}`}>
          <h2 className="text-lg font-bold text-[#1F4D3A] mb-3">Our Vision</h2>
          <p className="text-[#4C5A50] leading-relaxed">
            To become the digital infrastructure powering healthcare procurement across Africa by
            connecting every healthcare provider with trusted suppliers through a transparent,
            efficient, and intelligent procurement network.
          </p>
        </div>
        <div className={`rounded-2xl p-8 ${glassCard}`}>
          <h2 className="text-lg font-bold text-[#1F4D3A] mb-3">Our Mission</h2>
          <p className="text-[#4C5A50] leading-relaxed">
            To simplify, standardize, and modernize healthcare procurement by providing one
            integrated platform for sourcing, supplier discovery, procurement management,
            financing access through partners, LockseedX inventory, logistics, and procurement
            intelligence.
          </p>
        </div>
      </div>

      <div className={`max-w-4xl mx-auto rounded-2xl p-8 ${glassCard}`}>
        <h2 className="text-lg font-bold text-[#16231C] mb-4">What customers can do</h2>
        <ul className="space-y-2.5">
          {platformValueProps.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#4C5A50]">
              <CheckCircle2 size={16} className="text-[#1F4D3A] mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </ContentPageShell>
  );
}
