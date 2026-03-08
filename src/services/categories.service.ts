import api from './api-client';
import type { Category, CreateCategoryRequest } from '@/types';

export const categoriesService = {
  list: () => api.get<Category[]>('/api/categories').then(r => r.data),
  getById: (id: number) => api.get<Category>(`/api/categories/${id}`).then(r => r.data),
  create: (data: CreateCategoryRequest) => api.post<Category>('/api/categories', data).then(r => r.data),
  update: (id: number, data: Partial<CreateCategoryRequest>) => api.put<Category>(`/api/categories/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/api/categories/${id}`),
};
