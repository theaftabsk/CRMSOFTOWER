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
      return [];
    }
  },
  async getAccount(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch account');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getAccount notice:', e);
      return null;
    }
  },
  async getAccountStats(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts/stats/summary`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch account stats');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getAccountStats notice:', e);
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
      console.warn('API createAccount notice:', e);
      return null;
    }
  },
  async updateAccount(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateAccount notice:', e);
      return null;
    }
  },
  async deleteAccount(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API deleteAccount notice:', e);
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
  async updateDealStage(id: string, stage: string, lost_reason?: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/deals/${id}/stage`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify({ stage, lost_reason }),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async convertDealToInvoice(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/deals/${id}/convert-to-invoice`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.error('Failed to convert deal to invoice:', e);
      return null;
    }
  },

  // Tasks & Activities
  async getActivitiesStats(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/stats/summary`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch activity stats');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getActivitiesStats notice:', e);
      return null;
    }
  },
  async getActivity(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch activity');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getActivity notice:', e);
      return null;
    }
  },
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
      return [];
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
  async updateTask(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/tasks/${id}`, {
        method: 'PATCH',
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
  async deleteTask(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/tasks/${id}`, {
        method: 'DELETE',
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
      console.warn('API getCalls notice:', e);
      return [];
    }
  },
  async createCall(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/calls`, {
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
  async updateCall(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/calls/${id}`, {
        method: 'PATCH',
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
  async deleteCall(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/calls/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
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
      console.warn('API getMeetings notice:', e);
      return [];
    }
  },
  async createMeeting(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/meetings`, {
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
  async updateMeetingStatus(id: string, status: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/meetings/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async deleteMeeting(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/meetings/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  // Calendar & Video Integrations (OAuth & Provider APIs)
  async getCalendarIntegrations(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/calendar`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch calendar integrations');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async connectCalendarIntegration(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/calendar/connect`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.error('Failed to connect integration:', e);
      return null;
    }
  },
  async disconnectCalendarIntegration(provider: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/integrations/calendar/${provider}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return null;
    }
  },

  // Products & Catalog APIs
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
      console.warn('API getProducts notice:', e);
      return [];
    }
  },

  async getProduct(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch product');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getProduct notice:', e);
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
      console.warn('API createProduct notice:', e);
      return null;
    }
  },

  async updateProduct(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateProduct notice:', e);
      return null;
    }
  },

  async deleteProduct(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API deleteProduct notice:', e);
      return null;
    }
  },

  async getProductsStats(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/stats/summary`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch product stats');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getProductsStats notice:', e);
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
      console.warn('API getQuotes notice:', e);
      return [];
    }
  },

  async getQuotesStats(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/stats/summary`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch quote stats');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getQuotesStats notice:', e);
      return null;
    }
  },

  async getQuote(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch quote');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getQuote notice:', e);
      return null;
    }
  },

  async createQuote(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API createQuote notice:', e);
      return null;
    }
  },

  async updateQuote(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateQuote notice:', e);
      return null;
    }
  },

  async updateQuoteStatus(id: string, status: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateQuoteStatus notice:', e);
      return null;
    }
  },

  async convertQuoteToOrder(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${id}/convert-to-order`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API convertQuoteToOrder notice:', e);
      return null;
    }
  },

  async deleteQuote(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API deleteQuote notice:', e);
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
      console.warn('API getOrders notice:', e);
      return [];
    }
  },

  async getOrdersStats(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/stats/summary`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch order stats');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getOrdersStats notice:', e);
      return null;
    }
  },

  async getOrder(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch order');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getOrder notice:', e);
      return null;
    }
  },

  async createOrder(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API createOrder notice:', e);
      return null;
    }
  },

  async updateOrder(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateOrder notice:', e);
      return null;
    }
  },

  async updateOrderStatus(id: string, status: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateOrderStatus notice:', e);
      return null;
    }
  },

  async convertOrderToInvoice(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/convert-to-invoice`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API convertOrderToInvoice notice:', e);
      return null;
    }
  },

  async deleteOrder(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API deleteOrder notice:', e);
      return null;
    }
  },

  // Invoices & Billing
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
      return [];
    }
  },

  async getInvoicesStats(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/stats/summary`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch invoice stats');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getInvoicesStats notice:', e);
      return null;
    }
  },

  async getInvoice(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch invoice');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getInvoice notice:', e);
      return null;
    }
  },

  async createInvoice(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API createInvoice notice:', e);
      return null;
    }
  },

  async updateInvoice(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateInvoice notice:', e);
      return null;
    }
  },

  async updateInvoiceStatus(id: string, status: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateInvoiceStatus notice:', e);
      return null;
    }
  },

  async recordInvoicePayment(id: string, data: { amount: number; method: string; notes?: string; payment_date?: string }, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${id}/record-payment`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API recordInvoicePayment notice:', e);
      return null;
    }
  },

  async deleteInvoice(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API deleteInvoice notice:', e);
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

  // Web Forms
  async getWebForms(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch web forms');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return [];
    }
  },
  async getWebForm(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch web form');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async createWebForm(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms`, {
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
  async updateWebForm(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${id}`, {
        method: 'PUT',
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
  async duplicateWebForm(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${id}/duplicate`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async toggleWebForm(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${id}/toggle`, {
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
  async deleteWebForm(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async getWebFormSubmissions(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${id}/submissions`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return [];
    }
  },
  async getWebFormAnalytics(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${id}/analytics`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // API Keys (Partner / External Developer Integration)
  async getApiKeys(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch API keys');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return [];
    }
  },
  async createApiKey(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys`, {
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
  async revokeApiKey(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys/${id}/revoke`, {
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
  async deleteApiKey(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async getPartnerRequests(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys/requests`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return [];
    }
  },
  async approvePartnerRequest(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys/requests/${id}/approve`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async rejectPartnerRequest(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys/requests/${id}/reject`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async submitDeveloperRequest(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/public/developer-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Webhooks
  async getWebhooks(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch webhooks');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return [];
    }
  },
  async createWebhook(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks`, {
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
  async toggleWebhook(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks/${id}/toggle`, {
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
  async testWebhook(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks/${id}/test`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },
  async deleteWebhook(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/webhooks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return null;
    }
  },

  // Communications (Email & WhatsApp)
  async sendEmail(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/communications/email`, {
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
  async sendWhatsApp(data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/communications/whatsapp`, {
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
  async getCommunicationHistory(type: string, id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/communications/history/${type}/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return [];
    }
  },

  // Generic REST Methods
  async get(path: string, orgId?: string) {
    const res = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`, {
      headers: getHeaders(orgId),
      credentials: 'include',
    });
    return res.json();
  },

  async post(path: string, data: any, orgId?: string) {
    const res = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`, {
      method: 'POST',
      headers: getHeaders(orgId),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async delete(path: string, orgId?: string) {
    const res = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`, {
      method: 'DELETE',
      headers: getHeaders(orgId),
      credentials: 'include',
    });
    return res.json();
  },

  async bookPublicMeeting(data: any) {
    const res = await fetch(`${API_BASE_URL}/public/calendar/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ==========================================
  // Contacts Intelligence API
  // ==========================================
  async getContacts(query?: any, orgId?: string) {
    try {
      const q = new URLSearchParams();
      if (query?.search) q.append('search', query.search);
      if (query?.account_id) q.append('account_id', query.account_id);
      if (query?.buying_role) q.append('buying_role', query.buying_role);
      if (query?.department) q.append('department', query.department);
      if (query?.status) q.append('status', query.status);

      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await fetch(`${API_BASE_URL}/contacts${qs}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getContacts notice:', e);
      return [];
    }
  },

  async getContactStats(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/stats`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch contact stats');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getContactStats notice:', e);
      return null;
    }
  },

  async getContact(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch contact');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getContact notice:', e);
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
      console.warn('API createContact notice:', e);
      return null;
    }
  },

  async updateContact(id: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API updateContact notice:', e);
      return null;
    }
  },

  async deleteContact(id: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API deleteContact notice:', e);
      return null;
    }
  },

  async addContactActivity(contactId: string, data: any, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${contactId}/activities`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API addContactActivity notice:', e);
      return null;
    }
  },

  async deleteContactActivity(contactId: string, activityId: string, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${contactId}/activities/${activityId}`, {
        method: 'DELETE',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API deleteContactActivity notice:', e);
      return null;
    }
  },

  // Reports & Analytics
  async getReports(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getReports notice:', e);
      return null;
    }
  },

  // Subscriptions & Billing Engine
  async getSubscriptionPlans(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/plans`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getSubscriptionPlans notice:', e);
      return [];
    }
  },

  async getCurrentSubscription(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/current`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getCurrentSubscription notice:', e);
      return null;
    }
  },

  async upgradeSubscription(
    data: { planSlug: string; billingCycle: 'MONTHLY' | 'YEARLY'; seats?: number; paymentMethod?: string },
    orgId?: string,
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/upgrade`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API upgradeSubscription notice:', e);
      return null;
    }
  },

  async cancelSubscription(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API cancelSubscription notice:', e);
      return null;
    }
  },

  async getSubscriptionInvoices(orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/invoices`, {
        headers: getHeaders(orgId),
        credentials: 'include',
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API getSubscriptionInvoices notice:', e);
      return [];
    }
  },

  // --- CASHFREE PAYMENT GATEWAY INTEGRATION ---
  async getCashfreeConfig() {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/cashfree/config`);
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      return { isLive: false, env: 'TEST' };
    }
  },

  async createCashfreeOrder(
    data: {
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
      customerEmail?: string;
      customerPhone?: string;
      customerName?: string;
    },
    orgId?: string,
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/cashfree/create-order`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.error('API createCashfreeOrder error:', e);
      return null;
    }
  },

  async verifyCashfreeOrder(
    data: {
      order_id: string;
      planSlug: string;
      billingCycle: 'MONTHLY' | 'YEARLY';
      seats?: number;
    },
    orgId?: string,
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/cashfree/verify-order`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.error('API verifyCashfreeOrder error:', e);
      return null;
    }
  },

  async setTrialExpiredDebug(expired: boolean, orgId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/subscriptions/debug/toggle-trial-expired`, {
        method: 'POST',
        headers: getHeaders(orgId),
        credentials: 'include',
        body: JSON.stringify({ expired }),
      });
      const json = await res.json();
      return json?.data || json;
    } catch (e) {
      console.warn('API setTrialExpiredDebug error:', e);
      return null;
    }
  },
};



