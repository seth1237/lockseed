'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '@/lib/website-api';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onLoginSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#D7DCCE]">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[#16231C] mb-2">Welcome Back</h2>
          <p className="text-[#4C5A50]">Sign in to your Lockseed account</p>
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
                placeholder="you@example.com"
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

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
              loading || !email || !password
                ? 'bg-[#E8EBE1] text-[#4C5A50] cursor-not-allowed'
                : 'bg-[#f36b14] hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#D7DCCE]"></div>
          <span className="text-sm text-[#4C5A50]">New to Lockseed?</span>
          <div className="flex-1 h-px bg-[#D7DCCE]"></div>
        </div>

        <button
          onClick={onSwitchToSignup}
          className="w-full py-2.5 border-2 border-[#1F4D3A] text-[#1F4D3A] hover:bg-[#F1F3EC] font-semibold rounded-lg transition-all"
        >
          Create new account
        </button>

        <div className="mt-6 p-4 bg-[#F1F3EC] rounded-lg">
          <p className="text-xs text-[#4C5A50]">
            Request a quote from the marketplace to auto-create an account. A welcome email with login details will be sent.
          </p>
        </div>
      </div>
    </div>
  );
}
