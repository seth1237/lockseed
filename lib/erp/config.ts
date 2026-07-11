/** Local ERP (no auth) vs production ERP (may require ERP_API_TOKEN). */
export function getErpBaseUrl(): string {
  if (process.env.ERP_API_BASE_URL) {
    return process.env.ERP_API_BASE_URL.replace(/\/$/, '');
  }

  // Default to local ERP in development when ERP is running on :5010
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5010';
  }

  return 'https://backend.codewithseth.co.ke';
}

export function getErpOrgId(): string {
  const orgId = process.env.ERP_ORG_ID;
  if (!orgId) {
    throw new Error('ERP_ORG_ID is not configured');
  }
  return orgId;
}

/** ERP accepts orgId via query param, X-Org-Id header, or POST body. */
export const ERP_ORG_ID_HEADER = 'X-Org-Id';

export function getErpHeaders(contentType = 'application/json'): HeadersInit {
  const headers: Record<string, string> = {
    [ERP_ORG_ID_HEADER]: getErpOrgId(),
  };

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const token = process.env.ERP_API_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
