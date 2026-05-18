import api from './axios';
import type { Settings } from '../types';

export function mapBackendToFrontendSettings(backendData: any): Settings {
  if (!backendData) return {} as Settings;
  return {
    id: backendData.id || '',
    storeNameRu: backendData.storeName_ru || '',
    storeNameTj: backendData.storeName_tj || '',
    storeNameEn: backendData.storeName_en || '',
    phone: backendData.storePhone || '',
    email: backendData.storeEmail || '',
    whatsapp: backendData.whatsappNumber || '',
    addressRu: backendData.storeAddress_ru || '',
    addressTj: backendData.storeAddress_tj || '',
    addressEn: backendData.storeAddress_en || '',
    logo: backendData.logo || '',
    favicon: backendData.favicon || '',
    telegramBotToken: backendData.telegramBotToken || '',
    telegramChatId: backendData.telegramChatId || '',
  };
}

export function mapFrontendToBackendSettings(frontendData: Partial<Settings>): any {
  const payload: any = {};

  if (frontendData.telegramBotToken !== undefined) payload.telegramBotToken = frontendData.telegramBotToken.trim();
  if (frontendData.telegramChatId !== undefined) payload.telegramChatId = frontendData.telegramChatId.trim();
  
  if (frontendData.whatsapp !== undefined) {
    const rawWhatsapp = frontendData.whatsapp.trim();
    // Normalize whatsappNumber if present
    if (rawWhatsapp) payload.whatsappNumber = rawWhatsapp;
  }
  
  if (frontendData.storeNameRu !== undefined) payload.storeName_ru = frontendData.storeNameRu.trim();
  if (frontendData.storeNameTj !== undefined) payload.storeName_tj = frontendData.storeNameTj.trim();
  if (frontendData.storeNameEn !== undefined) payload.storeName_en = frontendData.storeNameEn.trim();
  
  if (frontendData.phone !== undefined) {
    const rawPhone = frontendData.phone.trim();
    if (rawPhone) payload.storePhone = rawPhone;
  }

  if (frontendData.addressRu !== undefined) payload.storeAddress_ru = frontendData.addressRu.trim();
  if (frontendData.addressTj !== undefined) payload.storeAddress_tj = frontendData.addressTj.trim();
  if (frontendData.addressEn !== undefined) payload.storeAddress_en = frontendData.addressEn.trim();
  
  if (frontendData.logo !== undefined) payload.logo = frontendData.logo || null;

  // Handle email with validation safety
  if (frontendData.email !== undefined) {
    const emailStr = frontendData.email.trim();
    if (emailStr && emailStr.includes('@')) {
      payload.storeEmail = emailStr;
    } else {
      payload.storeEmail = null; // Set to null to clear, avoiding IsEmail error on empty string
    }
  }

  // Final validation cleaning: Remove any keys that are empty strings or invalid
  const keys = Object.keys(payload);
  for (const key of keys) {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  }

  return payload;
}

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const { data } = await api.get<any>('/settings');
    return mapBackendToFrontendSettings(data);
  },

  update: async (settings: Partial<Settings>): Promise<Settings> => {
    const payload = mapFrontendToBackendSettings(settings);
    const { data } = await api.patch<any>('/settings', payload);
    return mapBackendToFrontendSettings(data);
  },

  testTelegram: async (): Promise<{ success: boolean }> => {
    const { data } = await api.post<{ success: boolean }>('/settings/telegram/test');
    return data;
  },
};
