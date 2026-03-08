import api from './api-client';
import type { DashboardData, DailyReport, MonthlyReport, RangeReport } from '@/types';

export const reportsService = {
  dashboard: () => api.get<DashboardData>('/api/admin/dashboard').then(r => r.data),
  daily: (date?: string) => api.get<DailyReport>('/api/admin/reports/daily', { params: { date } }).then(r => r.data),
  monthly: (year: number, month: number) =>
    api.get<MonthlyReport>('/api/admin/reports/monthly', { params: { year, month } }).then(r => r.data),
  range: (from: string, to: string) =>
    api.get<RangeReport>('/api/admin/reports/range', { params: { from, to } }).then(r => r.data),
};
