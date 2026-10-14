'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';
import { adminLogin, adminMe } from '@/lib/admin-api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminMe()
      .then((me) => {
        if (me.authenticated) router.replace('/admin');
      })
      .catch(() => {
        /* ignore — show login form */
      })
      .finally(() => setChecking(false));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9]">
        <Loader2 className="animate-spin text-[#1F4D3A]" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCF9] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border border-[#D7DCCE] rounded-2xl p-8 shadow-sm"
      >
        <div className="w-11 h-11 rounded-xl bg-[#F1F3EC] flex items-center justify-center mb-4">
          <KeyRound size={20} className="text-[#1F4D3A]" />
        </div>
        <h1 className="text-xl font-bold text-[#16231C] mb-1">Admin sign in</h1>
        <p className="text-sm text-[#4C5A50] mb-6">
          Sign in with your Lockseed admin password to manage supplier applications.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        <label className="block text-sm font-semibold text-[#16231C] mb-1.5">Admin password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full border border-[#D7DCCE] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-[#1F4D3A] hover:bg-[#173a2c] disabled:opacity-50 text-white font-semibold py-3 rounded-xl inline-flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Sign in
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full mt-3 text-sm text-[#4C5A50] hover:text-[#1F4D3A]"
        >
          Back to site
        </button>
      </form>
    </div>
  );
}
