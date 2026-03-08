import api from './api-client';
import type { Settings } from '@/types';

export const settingsService = {
  get: () => api.get<Settings>('/api/settings').then(r => r.data),
  update: (data: Partial<Settings>) => api.put<Settings>('/api/settings', data).then(r => r.data),
};
