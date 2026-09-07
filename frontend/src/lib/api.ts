const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const getHeaders = (orgId: string = 'ORG001') => ({
  'Content-Type': 'application/json',
  'x-org-id': orgId,
});

export const api = {
  // Executive Dashboard Reports
  async getDashboardReports(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getDashboardReports notice:', e);
      return null;
    }
  },

  // Leads
  async getLeads(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/leads`, { 
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch leads');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getLeads notice:', e);
      return null;
    }
  },
  async createLead(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.error('Failed to create lead via API:', e);
      return null;
    }
  },
  async convertLead(data: { leadId: string; dealTitle: string; dealValue: number; dealStage: string }, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/leads/convert`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.error('Failed to convert lead via API:', e);
      return null;
    }
  },

  // Contacts
  async getContacts(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, { 
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getContacts notice:', e);
      return null;
    }
  },
  async createContact(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Accounts
  async getAccounts(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts`, { 
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getAccounts notice:', e);
      return null;
    }
  },
  async createAccount(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Deals
  async getDeals(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/deals`, { 
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch deals');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getDeals notice:', e);
      return null;
    }
  },
  async createDeal(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async updateDealStage(id: string, stage: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/deals/${id}/stage`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify({ stage }),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Tasks & Activities
  async getTasks(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/tasks`, { 
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getTasks notice:', e);
      return null;
    }
  },
  async createTask(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/tasks`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async toggleTaskStatus(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/tasks/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Calls
  async getCalls(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/calls`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch calls');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Meetings
  async getMeetings(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/meetings`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch meetings');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Products
  async getProducts(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async createProduct(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Quotes
  async getQuotes(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Orders
  async getOrders(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Invoices & Payments
  async getInvoices(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices`, { 
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getInvoices notice:', e);
      return null;
    }
  },
  async getPayments(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/payments`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch payments');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async recordPayment(data: { invoiceId: string; amount: number; method: string; notes?: string }, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Settings & Custom Fields
  async getCustomFields(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/custom-fields`, { 
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch custom fields');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async addCustomField(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/custom-fields`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Audit Logs
  async getAuditLogs(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/audit-logs`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
};
