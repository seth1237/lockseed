// Client authentication utilities for localStorage-based session management

export interface ClientAccount {
  id: string;
  email: string;
  organization: string;
  password: string; // In production, this would never be stored in localStorage
  createdAt: string;
  phone?: string;
  address?: string;
}

export interface Session {
  clientId: string;
  email: string;
  organization: string;
}

export interface RFQRequest {
  id: string;
  referenceNumber: string;
  quotationId?: string;
  clientId: string;
  supplierId: string;
  supplierName: string;
  productCategory: string;
  erpProductId?: string;
  quantity: string;
  organization: string;
  email: string;
  location: string;
  urgency: string;
  notes: string;
  status: 'pending' | 'quoted' | 'confirmed';
  filedAt: string;
  quotedAt?: string;
  confirmedAt?: string;
  quotedPrice?: string;
}

// Initialize auth data in localStorage if it doesn't exist
export function initializeAuthData() {
  const existingClients = localStorage.getItem('lockseed_clients');
  const existingRequests = localStorage.getItem('lockseed_rfq_requests');
  
  if (!existingClients) {
    // Create demo account for testing
    const demoClient: ClientAccount = {
      id: 'client_demo_001',
      email: 'demo@hospital.com',
      organization: 'City Hospital Network',
      password: 'demo123',
      createdAt: new Date().toISOString(),
      phone: '+1-555-0123',
      address: '123 Medical Center Drive, Hospital City, HC 12345',
    };
    localStorage.setItem('lockseed_clients', JSON.stringify([demoClient]));
  }
  
  if (!existingRequests) {
    localStorage.setItem('lockseed_rfq_requests', JSON.stringify([]));
  }
}

// Register a new client account
export function registerClient(
  email: string,
  organization: string,
  password: string
): { success: boolean; error?: string; clientId?: string; session?: Session } {
  initializeAuthData();
  
  const clients = JSON.parse(localStorage.getItem('lockseed_clients') || '[]') as ClientAccount[];
  
  // Check if email already exists
  if (clients.some(c => c.email === email)) {
    return { success: false, error: 'Email already registered' };
  }
  
  const newClient: ClientAccount = {
    id: `client_${Date.now()}`,
    email,
    organization,
    password,
    createdAt: new Date().toISOString(),
  };
  
  clients.push(newClient);
  localStorage.setItem('lockseed_clients', JSON.stringify(clients));

  const session: Session = {
    clientId: newClient.id,
    email: newClient.email,
    organization: newClient.organization,
  };
  localStorage.setItem('lockseed_session', JSON.stringify(session));
  
  return { success: true, clientId: newClient.id, session };
}

// Login with email and password
export function loginClient(
  email: string,
  password: string
): { success: boolean; error?: string; session?: Session } {
  initializeAuthData();
  
  const clients = JSON.parse(localStorage.getItem('lockseed_clients') || '[]') as ClientAccount[];
  const client = clients.find(c => c.email === email && c.password === password);
  
  if (!client) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  const session: Session = {
    clientId: client.id,
    email: client.email,
    organization: client.organization,
  };
  
  localStorage.setItem('lockseed_session', JSON.stringify(session));
  return { success: true, session };
}

// Get current session
export function getSession(): Session | null {
  const session = localStorage.getItem('lockseed_session');
  return session ? JSON.parse(session) : null;
}

// Logout
export function logoutClient(): void {
  localStorage.removeItem('lockseed_session');
}

// Get client details
export function getClientDetails(clientId: string): ClientAccount | null {
  initializeAuthData();
  
  const clients = JSON.parse(localStorage.getItem('lockseed_clients') || '[]') as ClientAccount[];
  return clients.find(c => c.id === clientId) || null;
}

// Update client profile
export function updateClientProfile(
  clientId: string,
  updates: Partial<Omit<ClientAccount, 'id' | 'email' | 'password' | 'createdAt'>>
): boolean {
  initializeAuthData();
  
  const clients = JSON.parse(localStorage.getItem('lockseed_clients') || '[]') as ClientAccount[];
  const index = clients.findIndex(c => c.id === clientId);
  
  if (index === -1) return false;
  
  clients[index] = { ...clients[index], ...updates };
  localStorage.setItem('lockseed_clients', JSON.stringify(clients));
  
  return true;
}

// Save RFQ request
export function saveRFQRequest(
  request: Omit<RFQRequest, 'id' | 'referenceNumber' | 'filedAt'> & { quotationId?: string }
): RFQRequest {
  initializeAuthData();
  
  const requests = JSON.parse(localStorage.getItem('lockseed_rfq_requests') || '[]') as RFQRequest[];
  
  const referenceNumber =
    request.quotationId ||
    `LSK-RFQ-${new Date().getFullYear()}-${String(requests.length + 1).padStart(5, '0')}`;
  
  const newRequest: RFQRequest = {
    ...request,
    id: `rfq_${Date.now()}`,
    referenceNumber,
    quotationId: request.quotationId,
    filedAt: new Date().toISOString(),
  };
  
  requests.push(newRequest);
  localStorage.setItem('lockseed_rfq_requests', JSON.stringify(requests));
  
  return newRequest;
}

// Get client's RFQ requests
export function getClientRFQRequests(clientId: string): RFQRequest[] {
  initializeAuthData();
  
  const requests = JSON.parse(localStorage.getItem('lockseed_rfq_requests') || '[]') as RFQRequest[];
  return requests.filter(r => r.clientId === clientId);
}

// Get active quotations (pending or quoted status)
export function getActiveQuotations(clientId: string): RFQRequest[] {
  const requests = getClientRFQRequests(clientId);
  return requests.filter(r => r.status === 'pending' || r.status === 'quoted').sort((a, b) => 
    new Date(b.filedAt).getTime() - new Date(a.filedAt).getTime()
  );
}

// Get history (confirmed status)
export function getQuotationHistory(clientId: string): RFQRequest[] {
  const requests = getClientRFQRequests(clientId);
  return requests.filter(r => r.status === 'confirmed').sort((a, b) => 
    new Date(b.confirmedAt || b.filedAt).getTime() - new Date(a.filedAt).getTime()
  );
}

// Update RFQ status
export function updateRFQStatus(
  rfqId: string,
  status: 'pending' | 'quoted' | 'confirmed',
  updates?: { quotedPrice?: string; quotedAt?: string; confirmedAt?: string }
): boolean {
  initializeAuthData();
  
  const requests = JSON.parse(localStorage.getItem('lockseed_rfq_requests') || '[]') as RFQRequest[];
  const index = requests.findIndex(r => r.id === rfqId);
  
  if (index === -1) return false;
  
  requests[index] = {
    ...requests[index],
    status,
    ...updates,
  };
  
  localStorage.setItem('lockseed_rfq_requests', JSON.stringify(requests));
  return true;
}
