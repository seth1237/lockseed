'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { getMe } from '@/lib/website-api';
import type { WebsiteUser } from '@/lib/website-api';
import { submitQuoteRequest } from '@/lib/erp-api';
import { formatPrice } from '@/lib/erp/products';

const inputBase =
  'w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors';
const inputNormal = 'border-[#D7DCCE] bg-[#F1F3EC] focus:bg-white focus:border-[#1F4D3A]';
const inputError = 'border-[#A13B2E] bg-red-50';
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
  const productName = searchParams.get('product') || '';
  const productId = searchParams.get('productId') || '';
  const unitPriceParam = searchParams.get('unitPrice');
  const unitPrice = unitPriceParam ? Number(unitPriceParam) : 0;

  const [session, setSession] = useState<WebsiteUser | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    productName: productName,
    quantity: '',
    deliveryDate: '',
    email: '',
    organization: '',
    contactPerson: '',
    phone: '',
  });

  useEffect(() => {
    async function loadSession() {
      try {
        const { user } = await getMe();
        setSession(user);
        setFormData((prev) => ({
          ...prev,
          email: user.email,
          organization: user.company || user.name,
          contactPerson: user.name,
          phone: user.phone || prev.phone,
        }));
      } catch {
        router.push('/auth?redirect=/quote-request');
      }
    }
    loadSession();
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !session) return;

    setLoading(true);
    setSubmitError('');

    try {
      const quantity = Number(formData.quantity);
      if (!quantity || quantity <= 0) {
        throw new Error('Enter a valid quantity');
      }

      if (!productId) {
        throw new Error(
          'This quote must be started from a product in the marketplace. Browse products and click Request Quote.'
        );
      }

      const clientLocation = session.address || session.country || 'Not specified';

      await submitQuoteRequest({
        clientName: formData.contactPerson,
        clientNumber: formData.phone,
        clientLocation,
        email: formData.email,
        items: [
          {
            productId,
            quantity,
            unitPrice: unitPrice || 0,
          },
        ],
        productName: formData.productName,
        notes: `Requested delivery date: ${formData.deliveryDate}`,
      });

      setSubmitted(true);
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit quote request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCFCF9] to-[#F1F3EC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md shadow-lg border border-[#D7DCCE] text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} color="#1F4D3A" />
          </div>
          <h2 className="text-2xl font-bold text-[#16231C] mb-2">Quote Request Submitted!</h2>
          <p className="text-[#4C5A50] mb-4">
            We&apos;ll review your request and get back to you shortly.
          </p>
          <p className="text-sm text-[#4C5A50]">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCFCF9] to-[#F1F3EC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4C5A50]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCF9] to-[#F1F3EC]">
      {/* Header */}
      <header className="bg-white border-b border-[#D7DCCE] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#1F4D3A] hover:text-[#f36b14] font-semibold transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-mAseFfDMW3aKDSupzbbXpZO1faDURy.png"
            alt="Lockseed Supply"
            className="h-12 w-auto"
          />
          <h1 className="text-2xl font-bold text-[#16231C] ml-4">Request a Quote</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-700 text-sm">{submitError}</p>
          </div>
        )}

        {productId && (
          <div className="mb-6 p-4 bg-[#F1F3EC] border border-[#D7DCCE] rounded-xl">
            <p className="text-sm text-[#4C5A50]">Product</p>
            <p className="font-semibold text-[#16231C]">{productName || 'Selected product'}</p>
            {unitPrice > 0 && (
              <p className="text-sm text-[#f36b14] font-semibold mt-1">
                {formatPrice(unitPrice)} per unit
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Requester (read-only) */}
          <div className="bg-white rounded-2xl p-8 border border-[#D7DCCE]">
            <h2 className="text-xl font-bold text-[#16231C] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center text-sm font-semibold">
                1
              </span>
              Contact Details
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                    Organization
                  </label>
                  <input type="text" value={formData.organization} disabled className={inputReadOnly} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">Email</label>
                  <input type="email" value={formData.email} disabled className={inputReadOnly} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Full name"
                    className={`${inputBase} ${errors.contactPerson ? inputError : inputNormal}`}
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-[#A13B2E] mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.contactPerson}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+254 700 000 000"
                    className={`${inputBase} ${errors.phone ? inputError : inputNormal}`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-[#A13B2E] mt-1 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity & Delivery */}
          <div className="bg-white rounded-2xl p-8 border border-[#D7DCCE]">
            <h2 className="text-xl font-bold text-[#16231C] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center text-sm font-semibold">
                2
              </span>
              Quantity & Delivery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#2E6650] mb-2">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                  className={`${inputBase} ${errors.quantity ? inputError : inputNormal}`}
                />
                {errors.quantity && (
                  <p className="text-sm text-[#A13B2E] mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2E6650] mb-2">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.deliveryDate ? inputError : inputNormal}`}
                />
                {errors.deliveryDate && (
                  <p className="text-sm text-[#A13B2E] mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.deliveryDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-[#1F4D3A] text-[#1F4D3A] font-semibold rounded-lg hover:bg-[#F1F3EC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#f36b14] hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Request Quote'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
