import { apiClient } from './client';

export const leadsApi = {
  getAll: () => apiClient('/leads'),
  create: (data: any) => apiClient('/leads', { method: 'POST', body: JSON.stringify(data) }),
  convert: (data: any) => apiClient('/leads/convert', { method: 'POST', body: JSON.stringify(data) }),
};
