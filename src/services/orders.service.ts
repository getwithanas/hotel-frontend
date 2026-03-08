import api from './api-client';
import type { Order, OrderFilters, CreateOrderRequest, AddOrderItemsRequest, OrderStatus, OrderItemStatus } from '@/types';

export const ordersService = {
  list: (params?: OrderFilters) => api.get<Order[]>('/api/orders', { params }).then(r => r.data),
  getKitchenOrders: () => api.get<Order[]>('/api/orders/kitchen').then(r => r.data),
  getById: (id: number) => api.get<Order>(`/api/orders/${id}`).then(r => r.data),
  create: (data: CreateOrderRequest) => api.post<Order>('/api/orders', data).then(r => r.data),
  addItems: (id: number, data: AddOrderItemsRequest) => api.post<Order>(`/api/orders/${id}/items`, data).then(r => r.data),
  updateStatus: (id: number, status: OrderStatus) => api.patch(`/api/orders/${id}/status`, { status }).then(r => r.data),
  updateItemStatus: (itemId: number, status: OrderItemStatus) => api.patch(`/api/orders/items/${itemId}/status`, { status }).then(r => r.data),
  cancel: (id: number) => api.delete(`/api/orders/${id}`),
};
