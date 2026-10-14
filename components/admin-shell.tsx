'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { adminLogout } from '@/lib/admin-api';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/suppliers', label: 'Supplier leads', icon: Building2 },
];

export default function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await adminLogout();
    } catch {
      /* ignore */
    }
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FCFCF9] flex">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#D7DCCE] bg-white">
        <div className="h-14 px-5 flex items-center gap-2 border-b border-[#D7DCCE]">
          <ShieldCheck size={20} className="text-[#1F4D3A]" />
          <span className="font-bold text-[#16231C]">Lockseed Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#1F4D3A] text-white'
                    : 'text-[#3C4A40] hover:bg-[#F1F3EC]'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[#D7DCCE]">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#A13B2E] hover:bg-red-50"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 bg-white border-b border-[#D7DCCE] px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ShieldCheck size={18} className="md:hidden text-[#1F4D3A] shrink-0" />
            <h1 className="font-bold text-[#16231C] truncate">{title || 'Admin'}</h1>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-semibold text-[#1F4D3A] px-2 py-1 rounded bg-[#F1F3EC]"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={logout}
              className="text-xs font-semibold text-[#A13B2E] px-2 py-1"
            >
              Out
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
