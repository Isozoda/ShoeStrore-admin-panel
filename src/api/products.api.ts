import api from './axios';
import type { Product, PaginatedResponse } from '../types';

export interface ProductsFilter {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean | '';
}

export interface ProductFormData {
  nameRu: string;
  nameTj: string;
  nameEn: string;
  descriptionRu?: string;
  descriptionTj?: string;
  descriptionEn?: string;
  price: number;
  discountPercent?: number;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  brandId?: string;
  colors?: { nameRu: string; nameTj: string; nameEn: string; hexCode: string; }[];
  sizes?: { size: string; stock: number; }[];
}

export function mapBackendToFrontendProduct(data: any): Product {
  if (!data) return data;
  return {
    id: data.id,
    nameRu: data.nameRu || data.name_ru || '',
    nameTj: data.nameTj || data.name_tj || '',
    nameEn: data.nameEn || data.name_en || '',
    descriptionRu: data.descriptionRu || data.description_ru || '',
    descriptionTj: data.descriptionTj || data.description_tj || '',
    descriptionEn: data.descriptionEn || data.description_en || '',
    price: Number(data.price),
    discountPercent: Number(data.discountPercent || 0),
    finalPrice: Number(data.finalPrice || data.price),
    sku: data.sku,
    stock: Number(data.stock || 0),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : false,
    categoryId: data.categoryId,
    brandId: data.brandId || undefined,
    category: data.category ? {
      id: data.category.id,
      nameRu: data.category.nameRu || data.category.name_ru || '',
      nameTj: data.category.nameTj || data.category.name_tj || '',
      nameEn: data.category.nameEn || data.category.name_en || '',
      slug: data.category.slug,
    } as any : undefined,
    brand: data.brand ? {
      id: data.brand.id,
      name: data.brand.name,
      slug: data.brand.slug,
      logo: data.brand.logo,
    } as any : undefined,
    images: data.images || [],
    colors: Array.isArray(data.colors)
      ? data.colors.map((c: any) => ({
          id: c.id,
          nameRu: c.nameRu || c.name_ru || '',
          nameTj: c.nameTj || c.name_tj || '',
          nameEn: c.nameEn || c.name_en || '',
          hexCode: c.hexCode,
        }))
      : [],
    sizes: Array.isArray(data.sizes)
      ? data.sizes.map((s: any) => ({
          id: s.id,
          size: s.size,
          stock: Number(s.stock || 0),
        }))
      : [],
    createdAt: data.createdAt,
  };
}

export function mapFrontendToBackendProduct(formData: any): any {
  const payload: any = {
    name_ru: formData.nameRu,
    name_tj: formData.nameTj,
    name_en: formData.nameEn,
    price: Number(formData.price),
    discountPercent: formData.discountPercent !== undefined ? Number(formData.discountPercent) : 0,
    sku: formData.sku,
    stock: formData.stock !== undefined ? Number(formData.stock) : 0,
    isActive: formData.isActive !== undefined ? Boolean(formData.isActive) : true,
    isFeatured: formData.isFeatured !== undefined ? Boolean(formData.isFeatured) : false,
    categoryId: formData.categoryId,
    brandId: formData.brandId || undefined,
  };

  if (formData.descriptionRu !== undefined) payload.description_ru = formData.descriptionRu || '';
  if (formData.descriptionTj !== undefined) payload.description_tj = formData.descriptionTj || '';
  if (formData.descriptionEn !== undefined) payload.description_en = formData.descriptionEn || '';

  if (Array.isArray(formData.colors)) {
    payload.colors = formData.colors.map((c: any) => ({
      name_ru: c.nameRu || '',
      name_tj: c.nameTj || '',
      name_en: c.nameEn || '',
      hexCode: c.hexCode || '',
    }));
  }

  if (Array.isArray(formData.sizes)) {
    payload.sizes = formData.sizes.map((s: any) => ({
      size: String(s.size),
      stock: Number(s.stock || 0),
    }));
  }

  return payload;
}

export const productsApi = {
  getAll: async (filters: ProductsFilter = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.brandId) params.set('brandId', filters.brandId);
    if (filters.isActive !== '' && filters.isActive !== undefined)
      params.set('isActive', String(filters.isActive));
    const { data } = await api.get<any>(`/products/admin?${params.toString()}`);
    return {
      ...data,
      data: Array.isArray(data.data) ? data.data.map(mapBackendToFrontendProduct) : [],
    };
  },

  getOne: async (id: string): Promise<Product> => {
    const { data } = await api.get<any>(`/products/${id}`);
    return mapBackendToFrontendProduct(data);
  },

  create: async (formData: ProductFormData): Promise<Product> => {
    const backendData = mapFrontendToBackendProduct(formData);
    const { data } = await api.post<any>('/products', backendData);
    return mapBackendToFrontendProduct(data);
  },

  update: async (id: string, formData: Partial<ProductFormData>): Promise<Product> => {
    const backendData = mapFrontendToBackendProduct(formData);
    const { data } = await api.patch<any>(`/products/${id}`, backendData);
    return mapBackendToFrontendProduct(data);
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Product> => {
    const { data } = await api.patch<any>(`/products/${id}`, { isActive });
    return mapBackendToFrontendProduct(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  addImage: async (productId: string, file: File, isMain?: boolean): Promise<void> => {
    const form = new FormData();
    form.append('file', file);
    if (isMain) form.append('isMain', 'true');
    await api.post(`/products/${productId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: async (productId: string, imageId: string): Promise<void> => {
    await api.delete(`/products/${productId}/images/${imageId}`);
  },
};
