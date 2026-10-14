/**
 * Admin client — talks to the deployed Express backend (via /backend-api proxy),
 * not Vercel MongoDB. Password is stored in sessionStorage and sent as x-admin-key.
 */

export type AdminSupplierLead = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  website: string;
  supplierType: string;
  categories: string[];
  products: { name: string; category?: string; description?: string }[];
  documentsReady: string[];
  message: string;
  status: 'new' | 'reviewing' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'lockseed-admin-key';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(
  /\/+$/,
  ''
);

export function getStoredAdminKey() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(STORAGE_KEY) || '';
}

function setStoredAdminKey(key: string) {
  sessionStorage.setItem(STORAGE_KEY, key);
}

function clearStoredAdminKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}

async function adminApi<T>(path: string, options?: RequestInit): Promise<T> {
  const key = getStoredAdminKey();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-admin-key': key } : {}),
      ...options?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

export async function adminLogin(password: string) {
  const trimmed = password.trim();
  const response = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: trimmed }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Login failed (${response.status})`);
  }
  setStoredAdminKey(trimmed);
  return { success: true as const };
}

export async function adminLogout() {
  clearStoredAdminKey();
  return { success: true };
}

export async function adminMe() {
  const key = getStoredAdminKey();
  if (!key) {
    return { configured: true, authenticated: false };
  }
  try {
    await adminApi<{ configured: boolean; authenticated: boolean }>('/api/admin/me');
    return { configured: true, authenticated: true };
  } catch {
    clearStoredAdminKey();
    return { configured: true, authenticated: false };
  }
}

export async function fetchAdminStats() {
  return adminApi<{
    stats: {
      total: number;
      new: number;
      reviewing: number;
      accepted: number;
      rejected: number;
    };
    recent: {
      id: string;
      companyName: string;
      contactName: string;
      email: string;
      status: string;
      createdAt: string;
    }[];
  }>('/api/admin/stats');
}

export async function fetchAdminSupplierLeads(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return adminApi<{ leads: AdminSupplierLead[] }>(`/api/suppliers/leads${qs}`);
}

export async function updateAdminSupplierStatus(
  id: string,
  status: AdminSupplierLead['status']
) {
  return adminApi<{ lead: AdminSupplierLead }>(`/api/suppliers/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
