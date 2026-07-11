'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LockseedMarketplace from '@/components/lockseed-marketplace';

export default function MarketplacePage() {
  const router = useRouter();

  useEffect(() => {
    // Marketplace is public; login is only required for saving quote history locally
  }, [router]);

  return <LockseedMarketplace />;
}
