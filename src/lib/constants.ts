import type { UserRole, TableStatus, OrderStatus, OrderItemStatus, DeliveryStatus, PaymentMethod } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  WAITER: 'Waiter',
  KITCHEN: 'Kitchen',
  CASHIER: 'Cashier',
};

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  FREE: 'Free',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  BILLED: 'Billed',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'BILLED'];

export const ITEM_STATUS_LABELS: Record<OrderItemStatus, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'OTHER', label: 'Other' },
];

// Role-based route access
export const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/dashboard': ['ADMIN', 'CASHIER'],
  '/tables': ['ADMIN', 'WAITER'],
  '/orders': ['ADMIN', 'WAITER', 'CASHIER'],
  '/orders/new': ['ADMIN', 'WAITER', 'CASHIER'],
  '/kitchen': ['ADMIN', 'KITCHEN'],
  '/menu': ['ADMIN'],
  '/categories': ['ADMIN'],
  '/billing': ['ADMIN', 'CASHIER'],
  '/deliveries': ['ADMIN', 'WAITER', 'CASHIER'],
  '/reports': ['ADMIN', 'CASHIER'],
  '/staff': ['ADMIN'],
  '/settings': ['ADMIN'],
};

// Default landing page per role
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  ADMIN: '/dashboard',
  WAITER: '/tables',
  KITCHEN: '/kitchen',
  CASHIER: '/billing',
};
