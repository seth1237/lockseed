'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, Loader2 } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { adminMe, fetchAdminStats } from '@/lib/admin-api';

const statusStyles: Record<string, string> = {
  new: 'bg-amber-100 text-amber-900',
  reviewing: 'bg-sky-100 text-sky-900',
  accepted: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-red-100 text-red-900',
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewing: 0,
    accepted: 0,
    rejected: 0,
  });
  const [recent, setRecent] = useState<
    {
      id: string;
      companyName: string;
      contactName: string;
      email: string;
      status: string;
      createdAt: string;
    }[]
  >([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const me = await adminMe();
        if (!me.authenticated) {
          router.replace('/admin/login');
          return;
        }
        const data = await fetchAdminStats();
        if (!active) return;
        setStats(data.stats);
        setRecent(data.recent);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9]">
        <Loader2 className="animate-spin text-[#1F4D3A]" size={28} />
      </div>
    );
  }

  return (
    <AdminShell title="Overview">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total', value: stats.total },
          { label: 'New', value: stats.new },
          { label: 'Reviewing', value: stats.reviewing },
          { label: 'Accepted', value: stats.accepted },
          { label: 'Rejected', value: stats.rejected },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#D7DCCE] rounded-2xl p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8B9689]">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-[#16231C] mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#16231C]">Recent supplier applications</h2>
        <Link
          href="/admin/suppliers"
          className="text-sm font-semibold text-[#1F4D3A] inline-flex items-center gap-1"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="bg-white border border-[#D7DCCE] rounded-2xl p-12 text-center">
          <Building2 size={32} className="mx-auto text-[#D7DCCE] mb-2" />
          <p className="text-[#4C5A50]">No applications yet.</p>
        </div>
      ) : (
        <ul className="bg-white border border-[#D7DCCE] rounded-2xl divide-y divide-[#D7DCCE]">
          {recent.map((r) => (
            <li key={r.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#16231C] truncate">{r.companyName}</p>
                <p className="text-sm text-[#4C5A50] truncate">
                  {r.contactName} · {r.email}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${
                  statusStyles[r.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
