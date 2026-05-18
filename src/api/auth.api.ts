import api from './axios';
import type { AuthResponse, User } from '../types';

export const authApi = {
  login: async (phone: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { phone, password });
    return data;
  },

  register: async (name: string, phone: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, phone, password });
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};
