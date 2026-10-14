import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'lockseed_admin';

function getAdminSecret() {
  return process.env.ADMIN_KEY || process.env.ADMIN_PASSWORD || '';
}

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.ADMIN_KEY || 'lockseed-admin-dev';
}

export function isAdminConfigured() {
  return Boolean(getAdminSecret());
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminSecret();
  if (!expected) return false;
  return password === expected;
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as { role?: string };
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function setAdminCookie(res: NextResponse, token: string) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function serializeLead(lead: {
  _id: { toString(): string };
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  website?: string;
  supplierType: string;
  categories?: string[];
  products?: { name: string; category?: string; description?: string }[];
  documentsReady?: string[];
  message?: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}) {
  return {
    id: lead._id.toString(),
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    country: lead.country || '',
    city: lead.city || '',
    website: lead.website || '',
    supplierType: lead.supplierType,
    categories: lead.categories || [],
    products: lead.products || [],
    documentsReady: lead.documentsReady || [],
    message: lead.message || '',
    status: lead.status as 'new' | 'reviewing' | 'accepted' | 'rejected',
    createdAt:
      typeof lead.createdAt === 'string' ? lead.createdAt : lead.createdAt.toISOString(),
    updatedAt:
      typeof lead.updatedAt === 'string' ? lead.updatedAt : lead.updatedAt.toISOString(),
  };
}
