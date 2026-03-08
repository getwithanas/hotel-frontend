import api from './api-client';
import type { Bill, BillFilters, GenerateBillRequest } from '@/types';

export const billsService = {
  list: (params?: BillFilters) => api.get<Bill[]>('/api/bills', { params }).then(r => r.data),
  getByOrder: (orderId: number) => api.get<Bill>(`/api/bills/order/${orderId}`).then(r => r.data),
  getById: (id: number) => api.get<Bill>(`/api/bills/${id}`).then(r => r.data),
  generate: (data: GenerateBillRequest) => api.post<Bill>('/api/bills/generate', data).then(r => r.data),
};
