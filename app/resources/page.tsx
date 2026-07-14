'use client';

import { FileCheck, FileText, Users, MessageSquare, ArrowRight } from 'lucide-react';
import ContentPageShell from '@/components/content-page-shell';
import { glassCard, glassCardHover } from '@/components/site-chrome';

const resources = [
  {
    id: 'library',
    title: 'Sourcing Library',
    desc: 'Guides and checklists for healthcare procurement across common categories.',
    icon: FileCheck,
  },
  {
    id: 'templates',
    title: 'RFQ Templates',
    desc: 'Ready-to-use templates for diagnostics, PPE, pharmaceuticals, and devices.',
    icon: FileText,
  },
  {
    id: 'community',
    title: 'Community',
    desc: 'Connect with peers in healthcare procurement across Africa.',
    icon: Users,
  },
  {
    id: 'webinars',
    title: 'Webinars',
    desc: 'Live and on-demand sessions with operators and supply-chain experts.',
    icon: MessageSquare,
  },
];

export default function ResourcesPage() {
  return (
    <ContentPageShell
      eyebrow="Resources"
      title="Power your procurement team"
      description="Practical materials for buyers and supply-chain teams. More content is being published regularly."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {resources.map((r) => {
          const Icon = r.icon;
          return (
            <div
              id={r.id}
              key={r.id}
              className={`rounded-xl p-6 transition-all scroll-mt-28 ${glassCard} ${glassCardHover}`}
            >
              <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#1F4D3A]" />
              </div>
              <h2 className="font-bold text-[#16231C] mb-1.5">{r.title}</h2>
              <p className="text-sm text-[#4C5A50] mb-3">{r.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#8B9689]">
                Coming soon <ArrowRight size={14} />
              </span>
            </div>
          );
        })}
      </div>
    </ContentPageShell>
  );
}
