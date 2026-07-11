'use client';

import { useState } from 'react';
import { Mail, Building2, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { register } from '@/lib/website-api';

interface SignupFormProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSignupSuccess, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !organization || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        email,
        name: organization,
        company: organization,
        password,
      });
      onSignupSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    email && organization && password && confirmPassword && password === confirmPassword && password.length >= 6;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#D7DCCE]">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#16231C] mb-2">Create Account</h2>
          <p className="text-[#4C5A50]">Join Lockseed and start requesting quotes</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#16231C] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-[#4C5A50]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                className="w-full pl-10 pr-4 py-2.5 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f36b14] focus:border-transparent bg-white text-[#16231C]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-semibold text-[#16231C] mb-2">
              Organization Name
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-3.5 text-[#4C5A50]" />
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="City Hospital, Clinic Name, etc."
                className="w-full pl-10 pr-4 py-2.5 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f36b14] focus:border-transparent bg-white text-[#16231C]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#16231C] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-[#4C5A50]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f36b14] focus:border-transparent bg-white text-[#16231C]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[#4C5A50] hover:text-[#16231C] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#16231C] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-[#4C5A50]" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 border border-[#D7DCCE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f36b14] focus:border-transparent bg-white text-[#16231C]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-[#4C5A50] hover:text-[#16231C] transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
              loading || !isFormValid
                ? 'bg-[#E8EBE1] text-[#4C5A50] cursor-not-allowed'
                : 'bg-[#f36b14] hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#D7DCCE]"></div>
          <span className="text-sm text-[#4C5A50]">Already have an account?</span>
          <div className="flex-1 h-px bg-[#D7DCCE]"></div>
        </div>

        <button
          onClick={onSwitchToLogin}
          className="w-full py-2.5 border-2 border-[#1F4D3A] text-[#1F4D3A] hover:bg-[#F1F3EC] font-semibold rounded-lg transition-all"
        >
          Sign in to existing account
        </button>

        <div className="mt-6 space-y-3">
          {[
            'Access verified supplier catalog from ERP',
            'Track quotations in your dashboard',
            'Download invoices when ready',
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <CheckCircle size={18} className="text-[#2E6650] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#4C5A50]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
