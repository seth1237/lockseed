import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  clearAdminCookie,
  isAdminConfigured,
  setAdminCookie,
  signAdminToken,
  verifyAdminPassword,
} from '@/lib/admin/session';
import { jsonError } from '@/lib/api/helpers';

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return jsonError(
        'Admin is not configured. Set ADMIN_KEY in the Vercel / Next.js environment.',
        503
      );
    }

    const body = schema.parse(await request.json());
    if (!verifyAdminPassword(body.password)) {
      return jsonError('Invalid admin password', 401);
    }

    const res = NextResponse.json({ success: true });
    setAdminCookie(res, signAdminToken());
    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || 'Invalid input');
    }
    return jsonError(error instanceof Error ? error.message : 'Login failed', 500);
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  clearAdminCookie(res);
  return res;
}
