import api from './axios';
import type { Category } from '../types';

export interface CategoryFormData {
  name_ru: string;
  name_tj: string;
  name_en: string;
  slug: string;
  parentId?: string;
  image?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getOne: async (id: string): Promise<Category> => {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  create: async (form: any): Promise<Category> => {
    const payload = {
      name_ru: form.nameRu,
      name_tj: form.nameTj,
      name_en: form.nameEn,
      slug: form.slug,
      parentId: form.parentId || null,
      image: form.image || null,
    };
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  update: async (id: string, form: any): Promise<Category> => {
    const payload = {
      name_ru: form.nameRu,
      name_tj: form.nameTj,
      name_en: form.nameEn,
      slug: form.slug,
      parentId: form.parentId || null,
      image: form.image || null,
    };
    const { data } = await api.patch<Category>(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ url: string }>('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  },
};
