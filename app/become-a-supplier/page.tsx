'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Building2,
  Package,
  FileCheck,
  Send,
} from 'lucide-react';
import { SiteNav, SiteFooter, glassCard } from '@/components/site-chrome';
import { supplierCategories, supplierDocChecklist } from '@/lib/site-content';
import { submitSupplierApplication } from '@/lib/website-api';

type ProductRow = { name: string; category: string; description: string };

const inputClass =
  'w-full px-4 py-2.5 border-2 border-[#8B9689] bg-white text-[#16231C] placeholder:text-[#8B9689] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D3A] focus:border-[#1F4D3A]';

const tabs = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'documents', label: 'Documents', icon: FileCheck },
  { id: 'review', label: 'Submit', icon: Send },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function BecomeASupplierPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('company');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [supplierType, setSupplierType] = useState<
    'manufacturer' | 'distributor' | 'both' | 'other'
  >('distributor');
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([
    { name: '', category: '', description: '' },
  ]);
  const [documentsReady, setDocumentsReady] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDoc = (id: string) => {
    setDocumentsReady((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const updateProduct = (index: number, patch: Partial<ProductRow>) => {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const validateCompany = () => {
    if (!companyName.trim() || !contactName.trim() || !email.trim() || !phone.trim()) {
      setError('Company name, contact name, email, and phone are required.');
      return false;
    }
    if (categories.length === 0) {
      setError('Select at least one category you supply.');
      return false;
    }
    return true;
  };

  const validateProducts = () => {
    const filled = products.filter((p) => p.name.trim());
    if (filled.length === 0) {
      setError('Add at least one product you sell.');
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError('');
    if (tab === 'company') {
      if (!validateCompany()) return;
      setTab('products');
      return;
    }
    if (tab === 'products') {
      if (!validateProducts()) return;
      setTab('documents');
      return;
    }
    if (tab === 'documents') {
      setTab('review');
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateCompany() || !validateProducts()) return;

    setLoading(true);
    try {
      await submitSupplierApplication({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        website: website.trim() || undefined,
        supplierType,
        categories,
        products: products
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            category: p.category.trim() || undefined,
            description: p.description.trim() || undefined,
          })),
        documentsReady,
        message: message.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FCFCF9]">
        <SiteNav onExplore={() => router.push('/marketplace')} />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className={`rounded-2xl p-10 ${glassCard}`}>
            <CheckCircle2 size={56} className="mx-auto text-[#1F4D3A] mb-4" />
            <h1 className="text-2xl font-bold text-[#16231C] mb-2">Application received</h1>
            <p className="text-[#4C5A50] mb-8">
              Thanks for applying to join the Lockseed supplier network. Our team will review
              your company, products, and documents checklist and follow up by email.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-xl"
            >
              Back to home
            </button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCF9]">
      <SiteNav onExplore={() => router.push('/marketplace')} />

      <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 text-center">
        <span className="text-sm font-semibold text-[#1F4D3A]">Supplier onboarding</span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#16231C] mt-3 mb-4">
          Become a Supplier
        </h1>
        <p className="text-lg text-[#4C5A50]">
          Tell us about your company, what you sell, and which documents you already have. No ERP
          account is created yet — this is an interest application for our team to review.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map((t, i) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setError('');
                  setTab(t.id);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#1F4D3A] text-white'
                    : 'bg-white/70 text-[#4C5A50] border border-[#D7DCCE] hover:border-[#1F4D3A]'
                }`}
              >
                <span className="opacity-70">{i + 1}.</span>
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className={`rounded-2xl p-6 sm:p-8 ${glassCard}`}>
          {tab === 'company' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#16231C]">Company details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">
                    Company name *
                  </label>
                  <input
                    className={inputClass}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Legal company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">
                    Contact person *
                  </label>
                  <input
                    className={inputClass}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">
                    Supplier type *
                  </label>
                  <select
                    className={inputClass}
                    value={supplierType}
                    onChange={(e) =>
                      setSupplierType(e.target.value as typeof supplierType)
                    }
                  >
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="both">Manufacturer &amp; distributor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">Email *</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">Phone *</label>
                  <input
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">Country</label>
                  <input
                    className={inputClass}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">City</label>
                  <input
                    className={inputClass}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#16231C] mb-2">Website</label>
                  <input
                    className={inputClass}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#16231C] mb-3">
                  Categories you supply *
                </label>
                <div className="flex flex-wrap gap-2">
                  {supplierCategories.map((cat) => {
                    const on = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          on
                            ? 'bg-[#1F4D3A] text-white border-[#1F4D3A]'
                            : 'bg-white text-[#4C5A50] border-[#D7DCCE] hover:border-[#1F4D3A]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-[#16231C]">Products you sell</h2>
                <button
                  type="button"
                  onClick={() =>
                    setProducts((prev) => [...prev, { name: '', category: '', description: '' }])
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F4D3A]"
                >
                  <Plus size={16} /> Add product
                </button>
              </div>
              <p className="text-sm text-[#4C5A50]">
                List the main products or product lines you want buyers to find on Lockseed.
              </p>
              {products.map((p, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#D7DCCE] bg-white/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8B9689]">Product {i + 1}</span>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setProducts((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-[#A13B2E] hover:bg-red-50 p-1 rounded"
                        aria-label="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <input
                    className={inputClass}
                    value={p.name}
                    onChange={(e) => updateProduct(i, { name: e.target.value })}
                    placeholder="Product or line name *"
                  />
                  <select
                    className={inputClass}
                    value={p.category}
                    onChange={(e) => updateProduct(i, { category: e.target.value })}
                  >
                    <option value="">Category (optional)</option>
                    {supplierCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={p.description}
                    onChange={(e) => updateProduct(i, { description: e.target.value })}
                    placeholder="Short description (optional)"
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 'documents' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#16231C]">Documents checklist</h2>
              <p className="text-sm text-[#4C5A50]">
                Select what you already have. You do not upload files here — this helps our team
                know you are ready for verification.
              </p>
              <div className="space-y-3">
                {supplierDocChecklist.map((doc) => {
                  const on = documentsReady.includes(doc.id);
                  return (
                    <label
                      key={doc.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        on
                          ? 'border-[#1F4D3A] bg-[#F1F3EC]'
                          : 'border-[#D7DCCE] bg-white/70 hover:border-[#8B9689]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleDoc(doc.id)}
                        className="mt-1"
                      />
                      <span className="text-sm font-medium text-[#16231C]">{doc.label}</span>
                    </label>
                  );
                })}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#16231C] mb-2">
                  Anything else we should know?
                </label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          )}

          {tab === 'review' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#16231C]">Review &amp; submit</h2>
              <dl className="divide-y divide-[#D7DCCE] text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-[#4C5A50] font-semibold">Company</dt>
                  <dd className="text-[#16231C] font-bold text-right">{companyName || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-[#4C5A50] font-semibold">Contact</dt>
                  <dd className="text-[#16231C] text-right">
                    {contactName}
                    <br />
                    {email} · {phone}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-[#4C5A50] font-semibold">Type</dt>
                  <dd className="text-[#16231C] font-bold capitalize">{supplierType}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-[#4C5A50] font-semibold">Categories</dt>
                  <dd className="text-[#16231C] text-right">{categories.join(', ') || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-[#4C5A50] font-semibold">Products</dt>
                  <dd className="text-[#16231C] text-right">
                    {products
                      .filter((p) => p.name.trim())
                      .map((p) => p.name)
                      .join(', ') || '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-[#4C5A50] font-semibold">Documents ready</dt>
                  <dd className="text-[#16231C] text-right">
                    {documentsReady.length
                      ? supplierDocChecklist
                          .filter((d) => documentsReady.includes(d.id))
                          .map((d) => d.label)
                          .join('; ')
                      : 'None selected'}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-[#8B9689]">
                Submitting stores this lead in Lockseed for review. It does not create an ERP
                supplier account.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-[#D7DCCE]">
            {tab !== 'company' && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  const order: TabId[] = ['company', 'products', 'documents', 'review'];
                  setTab(order[Math.max(0, order.indexOf(tab) - 1)]);
                }}
                className="flex-1 border-2 border-[#D7DCCE] text-[#4C5A50] font-semibold py-2.5 rounded-xl"
              >
                Back
              </button>
            )}
            {tab !== 'review' ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-1 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit application'}
              </button>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
