const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Validate API URL in production
if (typeof window !== 'undefined' && API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  console.error('❌ NEXT_PUBLIC_API_URL must start with http:// or https://');
  console.error('Current value:', API_URL);
  console.error('Expected format: https://your-api-domain.com/api');
}

interface RequestOptions extends RequestInit {
  json?: unknown;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { json, ...fetchOptions } = options;

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include', // Important for cookies
  };

  if (json) {
    config.body = JSON.stringify(json);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, json?: unknown, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'POST', json }),
  
  put: <T>(endpoint: string, json?: unknown, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'PUT', json }),
  
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
