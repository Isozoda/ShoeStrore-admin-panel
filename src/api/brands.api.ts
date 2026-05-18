import api from './axios';
import type { Brand } from '../types';

export interface BrandFormData {
  name: string;
  slug: string;
  logo?: string;
}

export const brandsApi = {
  getAll: async (): Promise<Brand[]> => {
    const { data } = await api.get<Brand[]>('/brands');
    return data;
  },

  create: async (form: BrandFormData): Promise<Brand> => {
    const { data } = await api.post<Brand>('/brands', form);
    return data;
  },

  update: async (id: string, form: Partial<BrandFormData>): Promise<Brand> => {
    const { data } = await api.patch<Brand>(`/brands/${id}`, form);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/brands/${id}`);
  },
};
