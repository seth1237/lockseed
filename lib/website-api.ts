export interface WebsiteUser {
  id: string;
  erpClientId?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  address?: string;
  emailVerified: boolean;
  status: string;
  createdAt: string;
  lastLogin?: string;
}

export interface WebsiteQuote {
  id: string;
  quotationId: string;
  invoiceId?: string;
  status: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  clientLocation?: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardData {
  user: WebsiteUser;
  quotes: WebsiteQuote[];
  notifications: { id: string; title: string; message: string; read: boolean; createdAt: string }[];
  orders: unknown[];
  invoices: { quotationId: string; status: string }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }

  return payload as T;
}

export async function register(input: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  company?: string;
}) {
  return api<{ user: WebsiteUser; success: boolean }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function login(email: string, password: string) {
  return api<{ user: WebsiteUser; success: boolean }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return api<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
}

export async function getMe() {
  return api<{ user: WebsiteUser }>('/api/auth/me');
}

export async function getDashboard() {
  return api<DashboardData>('/api/dashboard');
}

export async function updateProfile(updates: Partial<WebsiteUser>) {
  return api<{ user: WebsiteUser }>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function submitQuote(body: {
  clientName: string;
  clientNumber: string;
  clientLocation: string;
  email: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  notes?: string;
  productName?: string;
}) {
  return api<{
    success: boolean;
    quotationId: string;
    isNewUser: boolean;
  }>('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function requestPasswordReset(email: string) {
  return api<{ success: boolean; message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return api<{ success: boolean }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}
