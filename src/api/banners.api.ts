import api from './axios';
import type { Banner } from '../types';

export interface BannerFormData {
  titleRu?: string;
  titleTj?: string;
  titleEn?: string;
  subtitleRu?: string;
  subtitleTj?: string;
  subtitleEn?: string;
  buttonTextRu?: string;
  buttonTextTj?: string;
  buttonTextEn?: string;
  image: string;
  link?: string;
  order?: number;
  isActive?: boolean;
}

export const bannersApi = {
  getAll: async (): Promise<Banner[]> => {
    const { data } = await api.get<Banner[]>('/banners/admin');
    return data;
  },

  create: async (form: BannerFormData): Promise<Banner> => {
    const { data } = await api.post<Banner>('/banners', form);
    return data;
  },

  update: async (id: string, form: Partial<BannerFormData>): Promise<Banner> => {
    const { data } = await api.patch<Banner>(`/banners/${id}`, form);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/banners/${id}`);
  },

  reorder: async (ids: string[]): Promise<void> => {
    await api.patch('/banners/reorder', { ids });
  },
};
