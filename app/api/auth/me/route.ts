import { NextResponse } from 'next/server';
import { getCurrentUser, sanitizeUser } from '@/lib/services/auth.service';
import { jsonError } from '@/lib/api/helpers';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError('Unauthorized', 401);
  }
  return NextResponse.json({ user: sanitizeUser(user) });
}
