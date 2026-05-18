export type Role = 'USER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ContactMethod = 'CALL' | 'TELEGRAM' | 'WHATSAPP';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: Role;
  createdAt: string;
  _count?: { orders: number };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Category {
  id: string;
  nameRu: string;
  nameTj: string;
  nameEn: string;
  slug: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  _count?: { products: number };
}

export interface ProductSize {
  id: string;
  size: string;
  stock: number;
}

export interface ProductColor {
  id: string;
  nameRu: string;
  nameTj: string;
  nameEn: string;
  hexCode: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

export interface Product {
  id: string;
  nameRu: string;
  nameTj: string;
  nameEn: string;
  descriptionRu?: string;
  descriptionTj?: string;
  descriptionEn?: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  sku: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  brandId?: string;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
  colorName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  clientName: string;
  clientPhone: string;
  address?: string;
  clientAddress?: string;
  contactMethod: ContactMethod;
  note?: string;
  status: OrderStatus;
  totalAmount: number;
  userId?: string;
  user?: User;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
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
  order: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  status: string;
  userId: string;
  user: User;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Settings {
  id: string;
  storeNameRu?: string;
  storeNameTj?: string;
  storeNameEn?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  addressRu?: string;
  addressTj?: string;
  addressEn?: string;
  logo?: string;
  favicon?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
}

export interface DashboardStats {
  totalOrders: number;
  monthRevenue: number;
  monthRevenueGrowth: number;
  activeUsers: number;
  pendingOrders: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image?: string;
  totalSold: number;
  revenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueChart: RevenuePoint[];
  ordersByStatus: OrdersByStatus[];
  topProducts: TopProduct[];
  recentOrders: Order[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
