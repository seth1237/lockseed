'use client';

import ContentPageShell from '@/components/content-page-shell';
import { glassCard } from '@/components/site-chrome';

export default function VisionPage() {
  return (
    <ContentPageShell
      eyebrow="Our direction"
      title="We are building infrastructure, not a catalogue"
      description="Lockseed exists to connect every healthcare provider with trusted suppliers through a transparent, efficient, and intelligent procurement network."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
            logistics, and procurement intelligence.
          </p>
        </div>
      </div>
    </ContentPageShell>
  );
}
