import api from './axios';
import type { Review, PaginatedResponse } from '../types';

export interface ReviewsFilter {
  page?: number;
  limit?: number;
  rating?: number | '';
  status?: string;
}

export const reviewsApi = {
  getAll: async (filters: ReviewsFilter = {}): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.rating) params.set('rating', String(filters.rating));
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    const { data } = await api.get<PaginatedResponse<Review>>(`/reviews?${params.toString()}`);
    return data;
  },

  updateStatus: async ({ id, status }: { id: string; status: string }): Promise<Review> => {
    const { data } = await api.patch<Review>(`/reviews/${id}/status`, { status });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};
