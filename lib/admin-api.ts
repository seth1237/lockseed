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

async function adminApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
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

export async function adminLogin(password: string) {
  return adminApi<{ success: boolean }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function adminLogout() {
  return adminApi<{ success: boolean }>('/api/admin/login', { method: 'DELETE' });
}

export async function adminMe() {
  return adminApi<{ configured: boolean; authenticated: boolean }>('/api/admin/me');
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
  return adminApi<{ leads: AdminSupplierLead[] }>(`/api/admin/suppliers${qs}`);
}

export async function updateAdminSupplierStatus(
  id: string,
  status: AdminSupplierLead['status']
) {
  return adminApi<{ lead: AdminSupplierLead }>(`/api/admin/suppliers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
