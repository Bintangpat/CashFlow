'use client';

import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  costPrice: number;
  sellPrice: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

interface CreateProductInput {
  name: string;
  sku?: string;
  costPrice: number;
  sellPrice: number;
  stock?: number;
}

interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

export function useProducts(options?: { page?: number; limit?: number; search?: string; active?: string }) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.page) params.set('page', options.page.toString());
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.search) params.set('search', options.search);
      if (options?.active) params.set('active', options.active);
      
      const response = await api.get<ProductsResponse>(`/products?${params.toString()}`);
      return response;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await api.get<ProductResponse>(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateProductInput) => 
      api.post<ProductResponse>('/products', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => 
      api.put<ProductResponse>(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
