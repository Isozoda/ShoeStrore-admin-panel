import api from './axios';
import type { User, PaginatedResponse, Role } from '../types';

export interface UsersFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | '';
}

export const usersApi = {
  getAll: async (filters: UsersFilter = {}): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.role) params.set('role', filters.role);
    const { data } = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
    return data;
  },

  updateRole: async ({ id, role }: { id: string; role: Role }): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}/role`, { role });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
