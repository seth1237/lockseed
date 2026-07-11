export function getErpBaseUrl() {
  if (process.env.ERP_API_BASE_URL) {
    return process.env.ERP_API_BASE_URL.replace(/\/$/, '');
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://backend.codewithseth.co.ke'
    : 'http://localhost:5010';
}

export function getErpOrgId() {
  const orgId = process.env.ERP_ORG_ID;
  if (!orgId) throw new Error('ERP_ORG_ID is not configured');
  return orgId;
}

export function getErpHeaders(contentType = 'application/json') {
  const headers = { 'X-Org-Id': getErpOrgId() };
  if (contentType) headers['Content-Type'] = contentType;
  if (process.env.ERP_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.ERP_API_TOKEN}`;
  }
  return headers;
}

export function getErpPdfHeaders() {
  return getErpHeaders('');
}
