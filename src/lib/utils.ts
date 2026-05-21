import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseAmount = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  // Handle Prisma Decimal objects or strings
  const str = typeof val === 'object' && val.toString ? val.toString() : String(val);
  const cleaned = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export function formatPrice(price: any): string {
  const numericPrice = parseAmount(price);
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice) + ' сомонӣ';
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SS-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23F1F5F9'/><rect x='25' y='25' width='30' height='30' rx='5' stroke='%23CBD5E1' stroke-width='2' fill='none'/><circle cx='35' cy='35' r='3' fill='%23CBD5E1'/><path d='M25,48 L35,38 L45,48 L50,43 L55,48' stroke='%23CBD5E1' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>";

export function getImageUrl(path: string): string {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const rawApiUrl = import.meta.env.VITE_API_URL || 'https://shoestore-api-n8oj.onrender.com/api';
  const baseUrl = rawApiUrl.replace('/api', '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
