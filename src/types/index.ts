export type ProductType = 'Versión Fan' | 'Versión Jugador' | 'Edición Especial' | 'Retro' | string;

export type AvailabilityStatus = 'Disponible' | 'Poco Stock' | 'Agotado' | string;

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  previousPrice?: number;
  originalPrice?: number;
  discount?: number; // percentage, e.g., 20
  isOffer?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  available?: boolean;
  isActive: boolean;
  imageUrl?: string;
  images: string[];
  description: string;
  sku?: string;
  details: {
    material: string;
    type: ProductType;
    availability: AvailabilityStatus;
    fit?: string;
    sizes?: string[];
  };
  sizes: string[]; // e.g., ['S', 'M', 'L', 'XL', 'XXL']
  stock?: number;
  stockPerSize: Record<string, number>; // e.g. { S: 5, M: 8, L: 4, XL: 2, XXL: 0 }
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  size: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'Pendiente'
  | 'Confirmado'
  | 'Preparando'
  | 'Listo'
  | 'Enviado'
  | 'Entregado'
  | 'Cancelado'
  | 'pendiente'
  | 'confirmado'
  | 'preparando'
  | 'listo'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export type DeliveryMethodId = 'domicilio' | 'retiro' | 'interior' | 'encomienda' | string;

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ALX-9482"
  customerName?: string;
  phone?: string;
  email?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: number | string; // Unix timestamp or ISO
  updatedAt?: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  deliveryMethod: DeliveryMethodId;
  address?: string;
  deliveryAddress: string;
  notes?: string;
  products?: OrderItem[];
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
}

export interface SaleProductItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

export interface Sale {
  id: string;
  orderId?: string;
  products: SaleProductItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  createdAt: string;
  notes?: string;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  discount: number;
  productIds: string[];
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryMethod {
  id: DeliveryMethodId;
  title: string;
  description: string;
  price: number;
  estimatedTime: string;
}

export interface StoreSettings {
  storeName: string;
  logo?: string;
  slogan: string;
  secondarySlogan: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
  address: string;
  hours: string;
  deliveryMethods: DeliveryMethod[];
  currencySymbol: string;
  bannerNotice: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
}
