import api from './api-client';
import type { MenuItem, MenuFilters } from '@/types';

export const menuService = {
  list: (params?: MenuFilters) => api.get<MenuItem[]>('/api/menu', { params }).then(r => r.data),
  getById: (id: number) => api.get<MenuItem>(`/api/menu/${id}`).then(r => r.data),
  create: (data: FormData) => api.post<MenuItem>('/api/menu', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  update: (id: number, data: FormData) => api.put<MenuItem>(`/api/menu/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  toggleAvailability: (id: number) => api.patch(`/api/menu/${id}/toggle`).then(r => r.data),
  delete: (id: number) => api.delete(`/api/menu/${id}`),
};
