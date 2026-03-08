// ── Enums ──
export type UserRole = 'ADMIN' | 'WAITER' | 'KITCHEN' | 'CASHIER';
export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'BILLED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'OTHER';
export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

// ── Auth ──
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ── User ──
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  active?: boolean;
}

// ── Table ──
export interface RestaurantTable {
  id: number;
  number: string;
  capacity: number;
  status: TableStatus;
  location?: string;
  activeOrders?: Order[];
  createdAt: string;
}

export interface CreateTableRequest {
  number: string;
  capacity: number;
  location?: string;
}

// ── Category ──
export interface Category {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  itemCount?: number;
  items?: MenuItem[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  sortOrder?: number;
}

// ── Menu Item ──
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isVeg: boolean;
  available: boolean;
  categoryId: number;
  category?: Category;
  createdAt: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  isVeg?: boolean;
  categoryId: number;
  image?: File;
}

// ── Order ──
export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
  note?: string;
  status: OrderItemStatus;
}

export interface Order {
  id: number;
  type: OrderType;
  status: OrderStatus;
  tableId?: number;
  table?: RestaurantTable;
  waiterId?: number;
  waiter?: User;
  items: OrderItem[];
  bill?: Bill;
  delivery?: Delivery;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  type: OrderType;
  tableId?: number;
  items: { menuItemId: number; quantity: number; note?: string }[];
  delivery?: {
    customerName: string;
    phone: string;
    address: string;
  };
}

export interface AddOrderItemsRequest {
  items: { menuItemId: number; quantity: number; notes?: string }[];
}

// ── Bill ──
export interface Bill {
  id: number;
  orderId: number;
  order?: Order;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface GenerateBillRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
  discount?: number;
}

// ── Delivery ──
export interface Delivery {
  id: number;
  orderId: number;
  order?: Order;
  customerName: string;
  phone: string;
  address: string;
  status: DeliveryStatus;
  deliveredAt?: string;
  createdAt: string;
}

// ── Reports ──
export interface DashboardData {
  today: {
    totalOrders: number;
    revenue: string;
    occupiedTables: number;
  };
  liveQueue: {
    pending: number;
    preparing: number;
    ready: number;
  };
  popularItems: { menuItemId: number; name: string; totalSold: number }[];
  recentOrders: (Order & { _count?: { items: number } })[];
}

export interface DailyReport {
  date: string;
  totalBills: number;
  totalRevenue: number;
  revenueByPayment: Record<PaymentMethod, number>;
  hourlyOrders: { hour: number; count: number }[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  dailySales: { date: string; revenue: number; orders: number }[];
  totalRevenue: number;
  totalOrders: number;
}

export interface RangeReport {
  from: string;
  to: string;
  totalRevenue: number;
  revenueByCategory: { category: string; revenue: number }[];
}

// ── Settings ──
export interface Settings {
  hotelName: string;
  taxRate: number;
  currency: string;
  address?: string;
  phone?: string;
  [key: string]: unknown;
}

// ── API ──
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

// ── Filters ──
export interface OrderFilters {
  status?: string;
  type?: OrderType;
  tableId?: number;
  date?: string;
  page?: number;
  limit?: number;
}

export interface TableFilters {
  status?: TableStatus;
  location?: string;
}

export interface MenuFilters {
  categoryId?: number;
  isVeg?: boolean;
  available?: boolean;
  search?: string;
}

export interface BillFilters {
  date?: string;
  paymentMethod?: PaymentMethod;
  page?: number;
  limit?: number;
}

export interface DeliveryFilters {
  status?: DeliveryStatus;
  page?: number;
  limit?: number;
}
