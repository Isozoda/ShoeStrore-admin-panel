import api from './axios';
import type { Order, OrderStatus, PaginatedResponse } from '../types';

export interface OrdersFilter {
  page?: number;
  limit?: number;
  status?: OrderStatus | '';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersApi = {
  getAll: async (filters: OrdersFilter = {}): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    const { data } = await api.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    return data;
  },

  getOne: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
};
