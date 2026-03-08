import api from './api-client';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types';

export const usersService = {
  list: (params?: { role?: string; active?: boolean }) => api.get<User[]>('/api/users', { params }).then(r => r.data),
  getById: (id: number) => api.get<User>(`/api/users/${id}`).then(r => r.data),
  create: (data: CreateUserRequest) => api.post<User>('/api/users', data).then(r => r.data),
  update: (id: number, data: UpdateUserRequest) => api.put<User>(`/api/users/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};
