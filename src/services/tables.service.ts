import api from './api-client';
import type { RestaurantTable, CreateTableRequest, TableFilters, TableStatus } from '@/types';

export const tablesService = {
  list: (params?: TableFilters) => api.get<RestaurantTable[]>('/api/tables', { params }).then(r => r.data),
  getById: (id: number) => api.get<RestaurantTable>(`/api/tables/${id}`).then(r => r.data),
  create: (data: CreateTableRequest) => api.post<RestaurantTable>('/api/tables', data).then(r => r.data),
  update: (id: number, data: Partial<CreateTableRequest>) => api.put<RestaurantTable>(`/api/tables/${id}`, data).then(r => r.data),
  updateStatus: (id: number, status: TableStatus) => api.patch(`/api/tables/${id}/status`, { status }).then(r => r.data),
  delete: (id: number) => api.delete(`/api/tables/${id}`),
};
