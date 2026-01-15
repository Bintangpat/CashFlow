'use client';

import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'CASHIER';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  success: boolean;
  data: User;
  message?: string;
}

interface OtpResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
    requiresVerification?: boolean;
    type?: 'SIGNUP' | 'LOGIN';
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        console.log('🔍 Checking authentication...');
        const response = await api.get<AuthResponse>('/auth/me');
        console.log('✅ Authenticated:', response.data);
        return response.data;
      } catch (err) {
        console.log('❌ Not authenticated:', err);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Request signup (sends OTP)
  const requestSignupMutation = useMutation({
    mutationFn: (input: { email: string }) => 
      api.post<OtpResponse>('/auth/register', input),
    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mendaftar');
    },
  });

  // Verify signup OTP
  const verifySignupMutation = useMutation({
    mutationFn: (input: { email: string; code: string }) => 
      api.post<AuthResponse>('/auth/verify-signup', input),
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast.success('Email berhasil diverifikasi!');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Kode OTP tidak valid');
    },
  });

  // Request login (sends OTP)
  const requestLoginMutation = useMutation({
    mutationFn: (input: { email: string }) => 
      api.post<OtpResponse>('/auth/login', input),
    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal login');
    },
  });

  // Verify login OTP
  const verifyLoginMutation = useMutation({
    mutationFn: (input: { email: string; code: string }) => 
      api.post<AuthResponse>('/auth/verify-login', input),
    onSuccess: (response) => {
      console.log('✅ Login verified:', response);
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast.success('Login berhasil!');
      console.log('🔄 Redirecting to dashboard...');
      router.push('/');
    },
    onError: (error: Error) => {
      console.log('❌ Login verification failed:', error);
      toast.error(error.message || 'Kode OTP tidak valid');
    },
  });

  // Resend OTP
  const resendOtpMutation = useMutation({
    mutationFn: (input: { email: string; type: 'SIGNUP' | 'LOGIN' }) => 
      api.post<OtpResponse>('/auth/resend-otp', input),
    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengirim ulang OTP');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      toast.success('Logout berhasil!');
      router.push('/login');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    requestSignup: requestSignupMutation.mutateAsync,
    verifySignup: verifySignupMutation.mutateAsync,
    requestLogin: requestLoginMutation.mutateAsync,
    verifyLogin: verifyLoginMutation.mutateAsync,
    resendOtp: resendOtpMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isRequestSignupPending: requestSignupMutation.isPending,
    isVerifySignupPending: verifySignupMutation.isPending,
    isRequestLoginPending: requestLoginMutation.isPending,
    isVerifyLoginPending: verifyLoginMutation.isPending,
    isResendOtpPending: resendOtpMutation.isPending,
  };
}
