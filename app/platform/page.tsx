'use client';

import ContentPageShell from '@/components/content-page-shell';
import { glassCard, glassCardHover } from '@/components/site-chrome';
import { capabilities } from '@/lib/site-content';

export default function PlatformPage() {
  return (
    <ContentPageShell
      eyebrow="Platform"
      title="Everything healthcare procurement needs"
      description="One platform for the full procurement lifecycle — an operating layer for how healthcare organizations source, buy, and manage suppliers."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className={`rounded-2xl p-6 transition-all ${glassCard} ${glassCardHover}`}>
              <div className="w-10 h-10 rounded-lg bg-white/70 shadow-[3px_3px_8px_rgba(31,77,58,0.10),-3px_-3px_8px_rgba(255,255,255,0.9)] flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#f36b14]" />
              </div>
              <h2 className="text-base font-bold text-[#16231C] mb-1.5">{c.title}</h2>
              <p className="text-sm text-[#4C5A50]">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </ContentPageShell>
  );
}
