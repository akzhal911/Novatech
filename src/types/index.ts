export type ProductCategory =
  | 'Smartphones'
  | 'Laptops'
  | 'Headphones'
  | 'Smart Watches'
  | 'Gaming'
  | 'Tablets'
  | 'Cameras'
  | 'Accessories';

export interface ProductConfig {
  name: string;
  priceDiff: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  specs: Record<string, string>;
  stock: number;
  rating: number;
  reviewsCount: number;
  colors?: string[];
  configurations?: ProductConfig[];
  isPublished: boolean;
  featured?: boolean;
  isNew?: boolean;
  isSpecialOffer?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedConfig?: string;
  pricePerUnit: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface CustomerShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  pricePerUnit: number;
  selectedColor?: string;
  selectedConfig?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerShippingInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
}

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: 'customer';
  token: string;
}

export interface AdminUser {
  username: string;
  role: 'admin';
  token: string;
}

export type Currency = 'USD' | 'EUR' | 'KZT';
export type Language = 'en' | 'ru';

export interface ActivityLog {
  id: string;
  type: 'order' | 'product_added' | 'product_updated' | 'product_deleted' | 'status_change';
  message: string;
  timestamp: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  recentOrders: Order[];
  topSellingProducts: { product: Product; unitsSold: number; revenue: number }[];
  activityLogs: ActivityLog[];
}
