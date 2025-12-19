/**
 * Products API client
 * 
 * API functions for product and category operations.
 */

import { apiClient } from './client';

// =============================================================================
// Types
// =============================================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  product_count?: number;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string;
  short_description: string;
  price: number | string;
  price_label?: string;
  pricing_type: 'annual' | 'one_time';
  currency: string;
  compare_at_price?: number;
  is_on_sale: boolean;
  discount_percentage: number;
  // Category can be object (detail) or flat fields (list)
  category?: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  };
  category_name?: string;
  category_slug?: string;
  product_type: 'tree' | 'forest' | 'lagoon' | 'experience';
  gallery?: ProductImage[];
  primary_image?: string;
  rating: number | string;
  reviews_count: number;
  features?: string[];
  is_featured: boolean;
  is_new: boolean;
  is_in_stock?: boolean;
  stock?: number;
  is_unlimited_stock?: boolean;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
  co2_offset_kg?: number | string;
  species?: string;
  area_size?: string;
  duration?: string;
  max_participants?: number;
  includes?: string[];
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

// =============================================================================
// API Functions
// =============================================================================

interface CategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<CategoryListResponse>('/api/categories/');
  return response.results || [];
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  return apiClient.get<Category>(`/api/categories/${slug}/`);
}

/**
 * Get all products with optional filters
 */
export async function getProducts(params?: {
  category?: string;
  product_type?: string;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<ProductListResponse> {
  return apiClient.get<ProductListResponse>('/api/products/', { params });
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  return apiClient.get<Product>(`/api/products/${slug}/`);
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 10): Promise<Product[]> {
  return apiClient.get<Product[]>('/api/products/featured/', {
    params: { limit },
  });
}

/**
 * Get new arrival products
 */
export async function getNewArrivals(limit = 10): Promise<Product[]> {
  return apiClient.get<Product[]>('/api/products/new_arrivals/', {
    params: { limit },
  });
}

/**
 * Get tree products
 */
export async function getTrees(): Promise<Product[]> {
  return apiClient.get<Product[]>('/api/products/trees/');
}

/**
 * Get retreat products
 */
export async function getRetreats(): Promise<Product[]> {
  return apiClient.get<Product[]>('/api/products/retreats/');
}

/**
 * Check product availability
 */
export async function checkAvailability(
  slug: string,
  quantity = 1
): Promise<{ is_available: boolean; stock: number | null }> {
  return apiClient.get(`/api/products/${slug}/availability/`, {
    params: { quantity },
  });
}
