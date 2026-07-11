'use client';

import { useRouter } from 'next/navigation';
import LandingPage from '@/components/landing-page';

export default function Page() {
  const router = useRouter();

  const handleExplore = () => {
    router.push('/marketplace');
  };

  const handleRequestQuote = () => {
    router.push('/marketplace');
  };

  return <LandingPage onExplore={handleExplore} onRequestQuote={handleRequestQuote} />;
}
