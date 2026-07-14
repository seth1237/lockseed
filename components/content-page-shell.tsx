'use client';

import { useRouter } from 'next/navigation';
import { SiteNav, SiteFooter } from '@/components/site-chrome';

export default function ContentPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FCFCF9] relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#f36b14]/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full bg-[#1F4D3A]/20 blur-[120px]" />
      </div>

      <SiteNav onExplore={() => router.push('/marketplace')} />

      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
        {eyebrow && (
          <span className="text-sm font-semibold text-[#1F4D3A]">{eyebrow}</span>
        )}
        <h1 className="text-3xl md:text-5xl font-bold text-[#16231C] mt-3 mb-4 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-[#4C5A50] max-w-2xl mx-auto leading-relaxed">{description}</p>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">{children}</main>

      <SiteFooter />
    </div>
  );
}
