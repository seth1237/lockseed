import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/services/auth.service';

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, error: null };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
