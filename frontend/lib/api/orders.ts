/**
 * Orders API client
 * 
 * API functions for cart and order operations.
 */

import { apiClient } from './client';
import type { Product } from './products';

// =============================================================================
// Types
// =============================================================================

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  selected_options: Record<string, string>;
  unit_price: number;
  line_total: number;
  added_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_title: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  selected_options: Record<string, string>;
}

export interface Order {
  id: string;
  order_number: string;
  status: 'Pending' | 'Paid' | 'Processing' | 'Fulfilled' | 'Cancelled' | 'Refunded';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  customer_email: string;
  customer_name: string;
  customer_notes: string;
  items: OrderItem[];
  is_paid: boolean;
  can_cancel: boolean;
  created_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
}

// =============================================================================
// Cart API Functions
// =============================================================================

/**
 * Get current cart
 */
export async function getCart(): Promise<Cart> {
  return apiClient.get<Cart>('/api/cart/');
}

/**
 * Add item to cart
 */
export async function addToCart(
  productId: number,
  quantity = 1,
  selectedOptions?: Record<string, string>
): Promise<Cart> {
  return apiClient.post<Cart>('/api/cart/add/', {
    product_id: productId,
    quantity,
    selected_options: selectedOptions || {},
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  productId: number,
  quantity: number
): Promise<Cart> {
  return apiClient.patch<Cart>(`/api/cart/update/${productId}/`, {
    quantity,
  });
}

/**
 * Remove item from cart
 */
export async function removeFromCart(productId: number): Promise<Cart> {
  return apiClient.delete<Cart>(`/api/cart/remove/${productId}/`);
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<Cart> {
  return apiClient.delete<Cart>('/api/cart/clear/');
}

/**
 * Get cart summary
 */
export async function getCartSummary(): Promise<{
  item_count: number;
  total_quantity: number;
  subtotal: string;
  total: string;
}> {
  return apiClient.get('/api/cart/summary/');
}

// =============================================================================
// Order API Functions
// =============================================================================

/**
 * Get user's orders
 */
export async function getOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>('/api/orders/');
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  return apiClient.get<Order>(`/api/orders/${orderId}/`);
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  return apiClient.get<Order>(`/api/orders/by-number/${orderNumber}/`);
}

/**
 * Create order from cart
 */
export async function createOrderFromCart(data?: {
  customer_name?: string;
  customer_notes?: string;
}): Promise<Order> {
  return apiClient.post<Order>('/api/orders/create_from_cart/', data || {});
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<Order> {
  return apiClient.post<Order>(`/api/orders/${orderId}/cancel/`);
}
