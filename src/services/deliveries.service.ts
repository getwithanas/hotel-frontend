import api from './api-client';
import type { Delivery, DeliveryFilters, DeliveryStatus } from '@/types';

export const deliveriesService = {
  list: (params?: DeliveryFilters) => api.get<Delivery[]>('/api/deliveries', { params }).then(r => r.data),
  getById: (id: number) => api.get<Delivery>(`/api/deliveries/${id}`).then(r => r.data),
  update: (id: number, data: { customerName?: string; phone?: string; address?: string }) =>
    api.put<Delivery>(`/api/deliveries/${id}`, data).then(r => r.data),
  updateStatus: (id: number, status: DeliveryStatus) =>
    api.patch(`/api/deliveries/${id}/status`, { status }).then(r => r.data),
};
