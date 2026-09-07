const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-org-id': 'ORG001',
};

export const api = {
  // Leads
  async getLeads() {
    try {
      const res = await fetch(`${API_BASE_URL}/leads`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  async createLead(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to create lead via API:', e);
      return null;
    }
  },
  async convertLead(data: { leadId: string; dealTitle: string; dealValue: number; dealStage: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/leads/convert`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to convert lead via API:', e);
      return null;
    }
  },

  // Contacts
  async getContacts() {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  async createContact(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Accounts
  async getAccounts() {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Deals
  async getDeals() {
    try {
      const res = await fetch(`${API_BASE_URL}/deals`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Failed to fetch deals');
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  async updateDealStage(id: string, stage: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/deals/${id}/stage`, {
        method: 'PATCH',
        headers: defaultHeaders,
        body: JSON.stringify({ stage }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Activities
  async getTasks() {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/tasks`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  async toggleTaskStatus(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/tasks/${id}/status`, {
        method: 'PATCH',
        headers: defaultHeaders,
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Finance
  async getInvoices() {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/invoices`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  async recordPayment(data: { invoiceId: string; amount: number; method: string; notes?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/payments`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Settings & Custom Fields
  async getCustomFields() {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/custom-fields`, { headers: defaultHeaders });
      if (!res.ok) throw new Error('Failed to fetch custom fields');
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  async addCustomField(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/custom-fields`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },
};
