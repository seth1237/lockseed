'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  User,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ShoppingCart,
  Download,
  Loader2,
  Bell,
  FileText,
  Receipt,
  ChevronRight,
  X,
} from 'lucide-react';
import { getDashboard, logout, updateProfile } from '@/lib/website-api';
import type { WebsiteUser, WebsiteQuote, DashboardData } from '@/lib/website-api';
import { downloadQuotationPdf, downloadInvoicePdf } from '@/lib/erp-api';
import { formatPrice } from '@/lib/erp/products';

interface ClientDashboardProps {
  user: WebsiteUser;
  onLogout: () => void;
}

type TabType = 'quotations' | 'invoices' | 'sales' | 'profile' | 'notifications';

export default function ClientDashboard({ user: initialUser, onLogout }: ClientDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('quotations');
  const [user, setUser] = useState(initialUser);
  const [quotes, setQuotes] = useState<WebsiteQuote[]>([]);
  const [notifications, setNotifications] = useState<DashboardData['notifications']>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileUpdates, setProfileUpdates] = useState<Partial<WebsiteUser>>({});
  const [loading, setLoading] = useState(true);
  const [downloadLoadingKey, setDownloadLoadingKey] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<WebsiteQuote | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDashboard();
      setUser(data.user);
      setQuotes(data.quotes);
      setNotifications(data.notifications);
    } finally {
      setLoading(false);
    }
  };

  const quotations = quotes.filter((q) => q.status === 'pending' || q.status === 'quoted');
  const invoices = quotes.filter((q) => q.status === 'confirmed' || q.status === 'invoiced');
  const completedSales = quotes.filter((q) => q.status === 'completed');

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const handleUpdateProfile = async () => {
    try {
      const { user: updated } = await updateProfile({
        name: profileUpdates.name || user.name,
        phone: profileUpdates.phone ?? user.phone,
        company: profileUpdates.company ?? user.company,
        country: profileUpdates.country ?? user.country,
        address: profileUpdates.address ?? user.address,
      });
      setUser(updated);
      setEditingProfile(false);
      setProfileUpdates({});
    } catch {
      // keep form open on error
    }
  };

  const handleDownloadQuotation = async (quotationId: string) => {
    const key = `quotation:${quotationId}`;
    setDownloadLoadingKey(key);
    setDownloadError('');
    try {
      await downloadQuotationPdf(quotationId);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to download quotation');
    } finally {
      setDownloadLoadingKey(null);
    }
  };

  const handleDownloadInvoice = async (quote: WebsiteQuote) => {
    const key = `invoice:${quote.quotationId}`;
    setDownloadLoadingKey(key);
    setDownloadError('');
    try {
      await downloadInvoicePdf({
        invoiceId: quote.invoiceId,
        quotationId: quote.quotationId,
      });
      if (!quote.invoiceId) {
        await loadData();
      }
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to download invoice');
    } finally {
      setDownloadLoadingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D7DCCE] border-t-[#f36b14] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4C5A50]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCF9]">
      <header className="bg-white border-b border-[#D7DCCE] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[#1F4D3A] hover:text-[#f36b14] font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <img
              src="/logo.png"
              alt="Lockseed Supply"
              className="h-12 w-auto"
            />
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/marketplace')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <ShoppingCart size={18} />
              Marketplace
            </button>
            <div className="text-right">
              <p className="text-sm text-[#4C5A50]">Welcome back</p>
              <p className="text-lg font-bold text-[#16231C]">{user.company || user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#A13B2E] text-[#A13B2E] hover:bg-red-50 font-semibold rounded-lg transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {downloadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-700 text-sm">{downloadError}</p>
          </div>
        )}

        <div className="flex gap-2 mb-8 border-b border-[#D7DCCE] overflow-x-auto">
          {[
            { id: 'quotations' as const, label: `Quotations (${quotations.length})`, icon: FileText },
            { id: 'invoices' as const, label: `Invoices (${invoices.length})`, icon: Receipt },
            { id: 'sales' as const, label: `Completed Sales (${completedSales.length})`, icon: CheckCircle },
            { id: 'notifications' as const, label: `Notifications (${notifications.length})`, icon: Bell },
            { id: 'profile' as const, label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-6 py-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'border-[#f36b14] text-[#f36b14]'
                  : 'border-transparent text-[#4C5A50] hover:text-[#16231C]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={20} />
                {label}
              </div>
            </button>
          ))}
        </div>

        {activeTab === 'quotations' && (
          <div>
            <h2 className="text-2xl font-bold text-[#16231C] mb-6">Quotations</h2>
            {quotations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#D7DCCE]">
                <FileText size={48} className="mx-auto text-[#D7DCCE] mb-4" />
                <p className="text-[#4C5A50] text-lg mb-4">No quotations yet</p>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="text-[#f36b14] font-semibold hover:underline"
                >
                  Browse the marketplace
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {quotations.map((req) => (
                  <QuoteCard
                    key={req.id}
                    quote={req}
                    variant="quotation"
                    onOpenDetail={setSelectedQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            <h2 className="text-2xl font-bold text-[#16231C] mb-6">Invoices</h2>
            {invoices.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#D7DCCE]">
                <Receipt size={48} className="mx-auto text-[#D7DCCE] mb-4" />
                <p className="text-[#4C5A50] text-lg">No invoices yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {invoices.map((req) => (
                  <QuoteCard
                    key={req.id}
                    quote={req}
                    variant="invoice"
                    onOpenDetail={setSelectedQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <h2 className="text-2xl font-bold text-[#16231C] mb-6">Completed Sales</h2>
            {completedSales.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#D7DCCE]">
                <CheckCircle size={48} className="mx-auto text-[#D7DCCE] mb-4" />
                <p className="text-[#4C5A50] text-lg">No completed sales yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedSales.map((req) => (
                  <QuoteCard
                    key={req.id}
                    quote={req}
                    variant="sale"
                    onOpenDetail={setSelectedQuote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="grid gap-3">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#D7DCCE]">
                <Bell size={48} className="mx-auto text-[#D7DCCE] mb-4" />
                <p className="text-[#4C5A50]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="bg-white rounded-xl p-5 border border-[#D7DCCE]">
                  <p className="font-semibold text-[#16231C]">{n.title}</p>
                  <p className="text-sm text-[#4C5A50] mt-1">{n.message}</p>
                  <p className="text-xs text-[#8B9689] mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold text-[#16231C] mb-6">Account Profile</h2>
            <div className="bg-white rounded-2xl p-8 border border-[#D7DCCE] max-w-2xl">
              {editingProfile ? (
                <div className="space-y-5">
                  {[
                    { key: 'name', label: 'Name', type: 'text' },
                    { key: 'phone', label: 'Phone', type: 'tel' },
                    { key: 'company', label: 'Company', type: 'text' },
                    { key: 'country', label: 'Country', type: 'text' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-[#16231C] mb-2">{label}</label>
                      <input
                        type={type}
                        value={(profileUpdates[key as keyof WebsiteUser] as string) ?? (user[key as keyof WebsiteUser] as string) ?? ''}
                        onChange={(e) =>
                          setProfileUpdates({ ...profileUpdates, [key]: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border-2 border-[#D7DCCE] bg-[#F1F3EC] rounded-lg focus:outline-none focus:bg-white focus:border-[#1F4D3A]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-[#16231C] mb-2">Address</label>
                    <textarea
                      value={profileUpdates.address ?? user.address ?? ''}
                      onChange={(e) => setProfileUpdates({ ...profileUpdates, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border-2 border-[#D7DCCE] bg-[#F1F3EC] rounded-lg focus:outline-none focus:bg-white focus:border-[#1F4D3A]"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 px-4 py-2.5 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold rounded-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileUpdates({});
                      }}
                      className="flex-1 px-4 py-2.5 border-2 border-[#D7DCCE] text-[#4C5A50] font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-5 mb-8">
                    {[
                      ['ORGANIZATION', user.company || user.name],
                      ['EMAIL', user.email],
                      ['PHONE', user.phone],
                      ['ADDRESS', user.address],
                      ['CREATED', new Date(user.createdAt).toLocaleDateString()],
                    ].map(([label, value]) =>
                      value ? (
                        <div key={label} className="pb-5 border-b border-[#D7DCCE]">
                          <p className="text-xs font-semibold text-[#2E6650]">{label}</p>
                          <p className="text-base font-semibold text-[#1F4D3A] mt-1">{value}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="w-full px-4 py-2.5 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold rounded-lg"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onDownloadQuotation={handleDownloadQuotation}
          onDownloadInvoice={handleDownloadInvoice}
          downloadLoadingKey={downloadLoadingKey}
        />
      )}
    </div>
  );
}

function QuoteCard({
  quote,
  variant,
  onOpenDetail,
}: {
  quote: WebsiteQuote;
  variant: 'quotation' | 'invoice' | 'sale';
  onOpenDetail: (quote: WebsiteQuote) => void;
}) {
  const badgeClass =
    variant === 'quotation'
      ? 'bg-yellow-100 text-yellow-800'
      : variant === 'invoice'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800';

  return (
    <button
      type="button"
      onClick={() => onOpenDetail(quote)}
      className="w-full text-left bg-white rounded-xl p-6 border border-[#D7DCCE] hover:shadow-md hover:border-[#f36b14] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#16231C]">{quote.productName || 'Quotation'}</h3>
          <p className="text-sm text-[#4C5A50]">
            Submitted {new Date(quote.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
        >
          {quote.status}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
        {quote.quantity && (
          <div>
            <p className="text-xs font-semibold text-[#4C5A50]">Quantity</p>
            <p className="font-bold text-[#16231C]">{quote.quantity}</p>
          </div>
        )}
        {quote.clientLocation && (
          <div>
            <p className="text-xs font-semibold text-[#4C5A50]">Location</p>
            <p className="font-bold text-[#16231C]">{quote.clientLocation}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-[#4C5A50]">Submitted</p>
          <p className="font-bold text-[#16231C]">{new Date(quote.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[#f36b14] font-semibold text-sm">
        View full details
        <ChevronRight size={16} />
      </div>
    </button>
  );
}

function QuoteDetailModal({
  quote,
  onClose,
  onDownloadQuotation,
  onDownloadInvoice,
  downloadLoadingKey,
}: {
  quote: WebsiteQuote;
  onClose: () => void;
  onDownloadQuotation: (id: string) => void;
  onDownloadInvoice: (quote: WebsiteQuote) => void;
  downloadLoadingKey: string | null;
}) {
  const status = (quote.status || '').toLowerCase();
  const isInvoiceStage =
    Boolean(quote.invoiceId) ||
    ['invoiced', 'completed', 'paid', 'fulfilled'].includes(status);

  const loadingKey = `${isInvoiceStage ? 'invoice' : 'quotation'}:${quote.quotationId}`;
  const isLoading = downloadLoadingKey === loadingKey;

  const lineTotal =
    quote.quantity && quote.unitPrice ? quote.quantity * quote.unitPrice : undefined;

  const rows: { label: string; value: string }[] = [
    { label: 'Status', value: quote.status },
    { label: 'Product', value: quote.productName || '—' },
    ...(quote.quantity ? [{ label: 'Quantity', value: String(quote.quantity) }] : []),
    ...(quote.unitPrice
      ? [{ label: 'Unit Price', value: formatPrice(quote.unitPrice) }]
      : []),
    ...(lineTotal ? [{ label: 'Line Total', value: formatPrice(lineTotal) }] : []),
    ...(quote.clientLocation ? [{ label: 'Location', value: quote.clientLocation }] : []),
    { label: 'Submitted', value: new Date(quote.createdAt).toLocaleString() },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-[#D7DCCE] sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-[#16231C]">
              {quote.productName || 'Quotation'}
            </h2>
            <p className="text-sm text-[#4C5A50] mt-1 capitalize">{quote.status}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#4C5A50] hover:text-[#16231C] hover:bg-[#F1F3EC] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <dl className="divide-y divide-[#D7DCCE]">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-3">
                <dt className="text-sm font-semibold text-[#4C5A50]">{row.label}</dt>
                <dd className="text-sm font-bold text-[#16231C] text-right break-all">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {quote.notes && (
            <div className="mt-4 p-4 bg-[#F1F3EC] rounded-lg">
              <p className="text-xs font-semibold text-[#4C5A50] mb-1">Notes</p>
              <p className="text-sm text-[#16231C] whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-[#D7DCCE]">
          <button
            onClick={() =>
              isInvoiceStage
                ? onDownloadInvoice(quote)
                : onDownloadQuotation(quote.quotationId)
            }
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isInvoiceStage ? 'Download Invoice' : 'Download Quotation'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-[#D7DCCE] text-[#4C5A50] hover:bg-[#F1F3EC] font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
