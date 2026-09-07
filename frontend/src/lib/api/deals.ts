import { apiClient } from './client';

export const dealsApi = {
  getAll: () => apiClient('/deals'),
  create: (data: any) => apiClient('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateStage: (id: string, stage: string) => apiClient(`/deals/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
};
