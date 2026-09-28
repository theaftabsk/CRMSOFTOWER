const API_BASE = '/api/superadmin';
const MASTER_KEY = 'zyvo-superadmin-master-key-2026';

async function fetchSuperAdmin(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-superadmin-secret': MASTER_KEY,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errorMsg;
    } catch (e) {
      // fallback
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json?.data !== undefined ? json.data : json;
}

export const superAdminApi = {
  getOverview: () => fetchSuperAdmin('/overview'),
  getTenants: (params?: { search?: string; plan?: string }) => {
    const qs = params ? new URLSearchParams(params as any).toString() : '';
    return fetchSuperAdmin(`/tenants${qs ? `?${qs}` : ''}`);
  },
  createTenant: (data: {
    name: string;
    adminEmail?: string;
    adminName?: string;
    vertical?: string;
    plan?: string;
    currency?: string;
  }) => fetchSuperAdmin('/tenants', { method: 'POST', body: JSON.stringify(data) }),
  updateTenant: (id: string, data: any) =>
    fetchSuperAdmin(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTenant: (id: string) =>
    fetchSuperAdmin(`/tenants/${id}`, { method: 'DELETE' }),
  getTenantById: (id: string) => fetchSuperAdmin(`/tenants/${id}`),
  toggleTenantStatus: (id: string) => fetchSuperAdmin(`/tenants/${id}/status`, { method: 'PATCH' }),
  exportTenantData: (id: string) => fetchSuperAdmin(`/tenants/${id}/export`),
  getSubscriptions: () => fetchSuperAdmin('/subscriptions'),
  getRevenue: () => fetchSuperAdmin('/revenue'),
  getSystemTelemetry: () => fetchSuperAdmin('/system'),
};
