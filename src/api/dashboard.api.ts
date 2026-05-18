import api from './axios';
import type { DashboardData } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardData> => {
    const { data } = await api.get<DashboardData>('/dashboard/stats');
    return data;
  },
};
