/**
 * API Client for Nature Marketplace
 * 
 * Centralized HTTP client for communicating with the Django backend.
 * Handles authentication, error handling, and request/response transformation.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Request options type
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  // Ensure path starts with /api/
  const apiPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? '' : '/'}${path}`;
  const url = new URL(apiPath, API_BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nature_access_token');
}

/**
 * Get current language from storage
 */
function getCurrentLanguage(): string {
  if (typeof window === 'undefined') return 'es';
  return localStorage.getItem('nature_locale') || 'es';
}

/**
 * Make an API request
 */
async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers: customHeaders, body, ...restOptions } = options;
  
  const url = buildUrl(path, params);
  const token = getAuthToken();
  const language = getCurrentLanguage();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept-Language': language,
    ...customHeaders,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    ...restOptions,
  });
  
  // Handle no content responses
  if (response.status === 204) {
    return {} as T;
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }
  
  return data as T;
}

/**
 * API client with typed methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('GET', path, options);
  },
  
  /**
   * POST request
   */
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('POST', path, { ...options, body: body as BodyInit });
  },
  
  /**
   * PUT request
   */
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PUT', path, { ...options, body: body as BodyInit });
  },
  
  /**
   * PATCH request
   */
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PATCH', path, { ...options, body: body as BodyInit });
  },
  
  /**
   * DELETE request
   */
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('DELETE', path, options);
  },
};

export default apiClient;
