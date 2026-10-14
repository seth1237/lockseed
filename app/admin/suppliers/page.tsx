'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import {
  adminMe,
  fetchAdminSupplierLeads,
  updateAdminSupplierStatus,
  type AdminSupplierLead,
} from '@/lib/admin-api';

const STATUSES: AdminSupplierLead['status'][] = ['new', 'reviewing', 'accepted', 'rejected'];

const statusStyles: Record<AdminSupplierLead['status'], string> = {
  new: 'bg-amber-100 text-amber-900',
  reviewing: 'bg-sky-100 text-sky-900',
  accepted: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-red-100 text-red-900',
};

export default function AdminSuppliersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [leads, setLeads] = useState<AdminSupplierLead[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    adminMe()
      .then((me) => {
        if (!me.authenticated) {
          router.replace('/admin/login');
          return;
        }
        setReady(true);
      })
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  const load = useCallback(async (statusFilter: string) => {
    setLoading(true);
    setError('');
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const { leads: next } = await fetchAdminSupplierLeads(status);
      setLeads(next);
    } catch (err) {
      setLeads([]);
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) void load(filter);
  }, [ready, filter, load]);

  const changeStatus = async (id: string, status: AdminSupplierLead['status']) => {
    setUpdatingId(id);
    setError('');
    try {
      const { lead } = await updateAdminSupplierStatus(id, status);
      setLeads((prev) => prev.map((l) => (l.id === id ? lead : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9]">
        <Loader2 className="animate-spin text-[#1F4D3A]" size={28} />
      </div>
    );
  }

  return (
    <AdminShell title="Supplier applications">
      <div className="flex flex-wrap items-center gap-2 justify-between mb-6">
        <p className="text-sm text-[#4C5A50]">
          {leads.length} application{leads.length === 1 ? '' : 's'}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-[#D7DCCE] rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => load(filter)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#D7DCCE] rounded-lg text-sm font-semibold text-[#1F4D3A] hover:bg-[#F1F3EC]"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-[#4C5A50]">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#D7DCCE] rounded-2xl">
          <Building2 size={36} className="mx-auto text-[#D7DCCE] mb-3" />
          <p className="text-[#4C5A50]">No supplier applications yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => {
            const open = expanded === lead.id;
            return (
              <li
                key={lead.id}
                className="bg-white border border-[#D7DCCE] rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : lead.id)}
                  className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#FCFCF9]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-[#16231C]">{lead.companyName}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusStyles[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#4C5A50]">
                      {lead.contactName} · {lead.supplierType}
                      {lead.city || lead.country
                        ? ` · ${[lead.city, lead.country].filter(Boolean).join(', ')}`
                        : ''}
                    </p>
                    <p className="text-xs text-[#8B9689] mt-1">
                      {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {open ? (
                    <ChevronUp size={18} className="text-[#8B9689] shrink-0 mt-1" />
                  ) : (
                    <ChevronDown size={18} className="text-[#8B9689] shrink-0 mt-1" />
                  )}
                </button>

                {open && (
                  <div className="px-5 pb-5 border-t border-[#D7DCCE] pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p className="flex items-center gap-2 text-[#4C5A50]">
                        <Mail size={14} className="text-[#1F4D3A]" />
                        <a href={`mailto:${lead.email}`} className="hover:underline">
                          {lead.email}
                        </a>
                      </p>
                      <p className="flex items-center gap-2 text-[#4C5A50]">
                        <Phone size={14} className="text-[#1F4D3A]" />
                        <a href={`tel:${lead.phone}`} className="hover:underline">
                          {lead.phone}
                        </a>
                      </p>
                      {lead.website ? (
                        <p className="sm:col-span-2 text-[#4C5A50]">
                          Website:{' '}
                          <a
                            href={
                              lead.website.startsWith('http')
                                ? lead.website
                                : `https://${lead.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#1F4D3A] hover:underline"
                          >
                            {lead.website}
                          </a>
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8B9689] mb-1">
                        Categories
                      </p>
                      <p className="text-sm text-[#16231C]">
                        {(lead.categories || []).join(', ') || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8B9689] mb-2">
                        Products
                      </p>
                      <ul className="space-y-1.5">
                        {(lead.products || []).map((p, i) => (
                          <li
                            key={`${p.name}-${i}`}
                            className="text-sm bg-[#F1F3EC] rounded-lg px-3 py-2"
                          >
                            <span className="font-semibold text-[#16231C]">{p.name}</span>
                            {p.category ? (
                              <span className="text-[#4C5A50]"> · {p.category}</span>
                            ) : null}
                            {p.description ? (
                              <p className="text-xs text-[#4C5A50] mt-0.5">{p.description}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8B9689] mb-1">
                        Documents ready
                      </p>
                      <p className="text-sm text-[#16231C]">
                        {(lead.documentsReady || []).join(', ') || 'None selected'}
                      </p>
                    </div>

                    {lead.message ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8B9689] mb-1">
                          Message
                        </p>
                        <p className="text-sm text-[#4C5A50] whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-[#8B9689] mr-1">Status:</span>
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={updatingId === lead.id || lead.status === s}
                          onClick={() => changeStatus(lead.id, s)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                            lead.status === s
                              ? 'border-[#1F4D3A] bg-[#1F4D3A] text-white'
                              : 'border-[#D7DCCE] text-[#4C5A50] hover:border-[#1F4D3A]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
