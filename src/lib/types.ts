export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  address?: Address;
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
}

export type PriceMode = "manual" | "calculated";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice?: number;
  markupPercent?: number;
  markupFixed?: number;
  priceMode?: PriceMode;
  taxRate: number;
  categoryId: string;
  imageUrl?: string;
  stock: number;
  active: boolean;
  featured: boolean;
  createdAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  imageUrl?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
}

export interface TaxBreakdownLine {
  rate: number;
  net: number;
  tax: number;
  gross: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotalNet: number;
  subtotalGross: number;
  taxTotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  notes?: string;
  invoiceId?: string;
  deliveryNoteId?: string;
  distanceKm?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotalNet: number;
  subtotalGross: number;
  taxTotal: number;
  taxBreakdown: TaxBreakdownLine[];
  shipping: number;
  total: number;
  status: InvoiceStatus;
  shippingAddress: Address;
  issuedAt: Date;
  dueAt: Date;
  paidAt?: Date;
}

export interface DeliveryNote {
  id: string;
  deliveryNoteNumber: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  createdAt: Date;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  zipPrefixes?: string[];
  zipFrom?: string;
  zipTo?: string;
  baseCost: number;
  freeFrom?: number;
  costPerKm?: number;
  sortOrder: number;
  active: boolean;
}

export interface CompanySettings {
  name: string;
  tagline: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  uid: string;
  firmenbuch?: string;
  iban: string;
  bic: string;
  bankName: string;
}

export interface OrderTotals {
  items: OrderItem[];
  subtotalNet: number;
  subtotalGross: number;
  taxTotal: number;
  taxBreakdown: TaxBreakdownLine[];
  shipping: number;
  total: number;
}
