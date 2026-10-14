import { NextResponse } from 'next/server';
import { getAdminSession, isAdminConfigured } from '@/lib/admin/session';

export async function GET() {
  const configured = isAdminConfigured();
  const authenticated = configured ? await getAdminSession() : false;
  return NextResponse.json({ configured, authenticated });
}
