'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LoginForm from '@/components/auth/login-form';
import SignupForm from '@/components/auth/signup-form';
import ClientDashboard from '@/components/auth/client-dashboard';
import { getMe } from '@/lib/website-api';
import type { WebsiteUser } from '@/lib/website-api';

type AuthView = 'login' | 'signup' | 'dashboard';

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<AuthView>('login');
  const [user, setUser] = useState<WebsiteUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const { user: currentUser } = await getMe();
        setUser(currentUser);

        const redirect = searchParams.get('redirect');
        const wantsMarketplace = searchParams.get('marketplace') === 'true';

        if (redirect) {
          router.replace(redirect);
          return;
        }
        if (wantsMarketplace) {
          router.replace('/marketplace');
          return;
        }
        setView('dashboard');
      } catch {
        setUser(null);
        setView('login');
      } finally {
        setMounted(true);
      }
    }

    loadSession();
  }, [router, searchParams]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCFCF9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D7DCCE] border-t-[#f36b14] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#4C5A50]">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = async () => {
    try {
      const { user: currentUser } = await getMe();
      setUser(currentUser);

      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
        return;
      }
      if (searchParams.get('marketplace') === 'true') {
        router.push('/marketplace');
        return;
      }
      setView('dashboard');
    } catch {
      setView('login');
    }
  };

  const handleSignupSuccess = handleLoginSuccess;

  const handleLogout = () => {
    setUser(null);
    setView('login');
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCFCF9] to-[#F1F3EC]">
      {view === 'dashboard' && user ? (
        <ClientDashboard user={user} onLogout={handleLogout} />
      ) : (
        <div className="flex flex-col min-h-screen px-4 py-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[#1F4D3A] hover:text-[#f36b14] font-semibold mb-4 transition-colors w-fit"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>

          <div className="flex flex-col items-center justify-center flex-1">
            <div className="mb-8">
              <img
                src="/logo.png"
                alt="Lockseed Supply"
                className="h-14 w-auto"
              />
            </div>

            {view === 'login' ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setView('signup')} />
            ) : (
              <SignupForm onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setView('login')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#FCFCF9]">
          <p className="text-[#4C5A50]">Loading...</p>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
