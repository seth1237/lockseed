'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle, Trash2, Plus } from 'lucide-react';
import { getMe } from '@/lib/website-api';
import type { WebsiteUser } from '@/lib/website-api';
import { submitQuoteRequest } from '@/lib/erp-api';
import { formatPrice } from '@/lib/erp/products';
import {
  getQuoteCart,
  setQuoteCart,
  addToQuoteCart,
  clearQuoteCart,
  summaryProductName,
  type QuoteCartItem,
} from '@/lib/quote-cart';

const inputBase =
  'w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-[#16231C] placeholder:text-[#8B9689]';
const inputNormal =
  'border-[#8B9689] bg-white focus:bg-white focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#f36b14]/30';
const inputError = 'border-[#A13B2E] bg-red-50 text-[#16231C]';
const inputReadOnly =
  'w-full px-4 py-3 border-2 border-[#D7DCCE] bg-[#EBEEE3] rounded-lg text-[#4C5A50] cursor-not-allowed';

export default function QuoteRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCFCF9] flex items-center justify-center">
          <p className="text-[#4C5A50]">Loading...</p>
        </div>
      }
    >
      <QuoteRequestContent />
    </Suspense>
  );
}

function QuoteRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seedProductName = searchParams.get('product') || '';
  const seedProductId = searchParams.get('productId') || '';
  const seedUnitPrice = searchParams.get('unitPrice')
    ? Number(searchParams.get('unitPrice'))
    : 0;

  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState<WebsiteUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    deliveryDate: '',
    email: '',
    organization: '',
    contactPerson: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    notes: '',
  });

  // Seed cart from URL product (if any) then load cart.
  useEffect(() => {
    if (seedProductId) {
      addToQuoteCart({
        productId: seedProductId,
        productName: seedProductName || 'Product',
        unitPrice: seedUnitPrice || 0,
        quantity: 1,
      });
    }
    setItems(getQuoteCart());
  }, [seedProductId, seedProductName, seedUnitPrice]);

  useEffect(() => {
    async function loadSession() {
      try {
        const { user } = await getMe();
        setSession(user);
        setIsGuest(false);
        setFormData((prev) => ({
          ...prev,
          email: user.email,
          organization: user.company || user.name,
          contactPerson: user.name,
          phone: user.phone || prev.phone,
          location: user.address || user.country || prev.location,
        }));
      } catch {
        // First-time / anonymous: stay on this page with signup + quote form.
        setSession(null);
        setIsGuest(true);
      } finally {
        setAuthLoading(false);
      }
    }
    loadSession();
  }, []);

  const persistItems = (next: QuoteCartItem[]) => {
    setItems(next);
    setQuoteCart(next);
  };

  const validateForm = () => {
    const next: Record<string, string> = {};

    if (items.length === 0) next.items = 'Add at least one product to your quote';
    if (items.some((i) => !i.quantity || i.quantity <= 0)) {
      next.items = 'Each product needs a quantity greater than zero';
    }
    if (!formData.deliveryDate) next.deliveryDate = 'Delivery date is required';

    if (isGuest) {
      if (!formData.organization.trim()) next.organization = 'Organization is required';
      if (!formData.contactPerson.trim()) next.contactPerson = 'Contact person is required';
      if (!formData.email.trim()) next.email = 'Email is required';
      if (!formData.phone.trim()) next.phone = 'Phone number is required';
      if (!formData.location.trim()) next.location = 'Location is required';
      if (!formData.password || formData.password.length < 6) {
        next.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        next.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.contactPerson.trim()) next.contactPerson = 'Contact person is required';
      if (!formData.phone.trim()) next.phone = 'Phone number is required';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError('');

    try {
      const clientLocation =
        formData.location.trim() ||
        session?.address ||
        session?.country ||
        'Not specified';

      await submitQuoteRequest({
        clientName: formData.contactPerson.trim(),
        clientNumber: formData.phone.trim(),
        clientLocation,
        email: formData.email.trim(),
        company: formData.organization.trim() || undefined,
        password: isGuest ? formData.password : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice) || 0,
        })),
        productName: summaryProductName(items),
        notes: [
          formData.deliveryDate ? `Requested delivery date: ${formData.deliveryDate}` : '',
          formData.notes.trim(),
        ]
          .filter(Boolean)
          .join('\n'),
      });

      clearQuoteCart();
      setSubmitted(true);
      setTimeout(() => {
        router.push('/auth');
      }, 1800);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit quote request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FCFCF9] flex items-center justify-center">
        <p className="text-[#4C5A50]">Loading...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCFCF9] to-[#F1F3EC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md shadow-lg border border-[#D7DCCE] text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} color="#1F4D3A" />
          </div>
          <h2 className="text-2xl font-bold text-[#16231C] mb-2">Quote request submitted</h2>
          <p className="text-[#4C5A50] mb-2">
            {isGuest
              ? 'Your account was created and you are signed in.'
              : 'Your quotation has been sent to our team.'}
          </p>
          <p className="text-sm text-[#4C5A50]">Taking you to your client dashboard...</p>
        </div>
      </div>
    );
  }

  const stepAccount = isGuest ? 1 : null;
  const stepProducts = isGuest ? 2 : 1;
  const stepDelivery = isGuest ? 3 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCF9] to-[#F1F3EC]">
      <header className="bg-white border-b border-[#D7DCCE] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-2 text-[#1F4D3A] hover:text-[#f36b14] font-semibold"
            title="Back to marketplace"
          >
            <ArrowLeft size={20} />
          </button>
          <img src="/logo.png" alt="Lockseed Supply" className="h-12 w-auto" />
          <h1 className="text-2xl font-bold text-[#16231C] ml-4">Request a Quote</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {isGuest && (
          <div className="mb-6 p-4 bg-[#F1F3EC] border border-[#D7DCCE] rounded-xl text-sm text-[#4C5A50]">
            First quote creates your Lockseed account. After submit you go straight to your client
            dashboard — no separate sign-up step.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account / contact */}
          <div className="bg-white rounded-2xl p-8 border border-[#D7DCCE]">
            <h2 className="text-xl font-bold text-[#16231C] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center text-sm font-semibold">
                {stepAccount ?? 1}
              </span>
              {isGuest ? 'Create account & contact' : 'Your details'}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                    Organization {isGuest && '*'}
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    disabled={!isGuest}
                    className={!isGuest ? inputReadOnly : `${inputBase} ${errors.organization ? inputError : inputNormal}`}
                    placeholder="Hospital / clinic / company"
                  />
                  {errors.organization && (
                    <p className="text-sm text-[#A13B2E] mt-1">{errors.organization}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                    Email {isGuest && '*'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isGuest}
                    className={!isGuest ? inputReadOnly : `${inputBase} ${errors.email ? inputError : inputNormal}`}
                    placeholder="you@organization.com"
                  />
                  {errors.email && <p className="text-sm text-[#A13B2E] mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                    Contact person *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.contactPerson ? inputError : inputNormal}`}
                    placeholder="Full name"
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-[#A13B2E] mt-1">{errors.contactPerson}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
                    placeholder="+254 ..."
                  />
                  {errors.phone && <p className="text-sm text-[#A13B2E] mt-1">{errors.phone}</p>}
                </div>
              </div>

              {isGuest && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                      Location / address *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`${inputBase} ${errors.location ? inputError : inputNormal}`}
                      placeholder="City, country, or delivery address"
                    />
                    {errors.location && (
                      <p className="text-sm text-[#A13B2E] mt-1">{errors.location}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
                        placeholder="At least 6 characters"
                      />
                      {errors.password && (
                        <p className="text-sm text-[#A13B2E] mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                        Confirm password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${inputBase} ${errors.confirmPassword ? inputError : inputNormal}`}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-[#A13B2E] mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#8B9689]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="text-[#1F4D3A] font-semibold underline"
                      onClick={() =>
                        router.push(
                          `/auth?redirect=${encodeURIComponent('/quote-request')}`
                        )
                      }
                    >
                      Log in
                    </button>{' '}
                    to skip these fields next time.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl p-8 border border-[#D7DCCE]">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold text-[#16231C] flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center text-sm font-semibold">
                  {stepProducts}
                </span>
                Products
              </h2>
              <button
                type="button"
                onClick={() => router.push('/marketplace')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#f36b14]"
              >
                <Plus size={16} /> Add more from marketplace
              </button>
            </div>

            {errors.items && (
              <p className="text-sm text-[#A13B2E] mb-4 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.items}
              </p>
            )}

            {items.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#D7DCCE] rounded-xl">
                <p className="text-[#4C5A50] mb-4">No products in this quote yet.</p>
                <button
                  type="button"
                  onClick={() => router.push('/marketplace')}
                  className="bg-[#f36b14] text-white font-semibold py-2.5 px-5 rounded-lg"
                >
                  Browse marketplace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_120px_40px] gap-3 items-center p-4 rounded-xl border border-[#D7DCCE] bg-[#FCFCF9]"
                  >
                    <div>
                      <p className="font-semibold text-[#16231C]">{item.productName}</p>
                      <p className="text-sm text-[#f36b14] font-semibold">
                        {formatPrice(item.unitPrice)} / unit
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4C5A50] mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = Number(e.target.value) || 0;
                          persistItems(
                            items.map((i) =>
                              i.productId === item.productId ? { ...i, quantity: qty } : i
                            )
                          );
                        }}
                        className={`${inputBase} ${inputNormal} py-2`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        persistItems(items.filter((i) => i.productId !== item.productId))
                      }
                      className="justify-self-end text-[#A13B2E] p-2 rounded-lg hover:bg-red-50"
                      aria-label="Remove product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl p-8 border border-[#D7DCCE]">
            <h2 className="text-xl font-bold text-[#16231C] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center text-sm font-semibold">
                {stepDelivery}
              </span>
              Delivery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                  Delivery date *
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.deliveryDate ? inputError : inputNormal}`}
                />
                {errors.deliveryDate && (
                  <p className="text-sm text-[#A13B2E] mt-1">{errors.deliveryDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2E6650] mb-2">Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className={`${inputBase} ${inputNormal}`}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/marketplace')}
              className="flex-1 px-6 py-3 border-2 border-[#1F4D3A] text-[#1F4D3A] font-semibold rounded-lg hover:bg-[#F1F3EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="flex-1 px-6 py-3 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              {loading
                ? 'Submitting...'
                : isGuest
                  ? 'Submit quote & open dashboard'
                  : 'Request Quote'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
