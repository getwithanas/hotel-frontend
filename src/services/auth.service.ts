import api from './api-client';
import type { LoginRequest, LoginResponse, User, ChangePasswordRequest } from '@/types';

export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/api/auth/login', data).then(r => r.data),
  me: () => api.get<User>('/api/auth/me').then(r => r.data),
  changePassword: (data: ChangePasswordRequest) => api.put('/api/auth/change-password', data),
};
