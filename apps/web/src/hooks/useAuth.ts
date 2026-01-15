'use client';

import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

interface MessageResponse {
  success: boolean;
  data: {
    message: string;
    email: string;
    requiresVerification?: boolean;
  };
}

export function useAuth() {
  const queryClient = useQueryClient();

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

  // Register with email + password (sends OTP)
  const registerMutation = useMutation({
    mutationFn: (input: { email: string; password: string; passwordConfirmation: string }) => 
      api.post<MessageResponse>('/auth/register', input),
    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mendaftar');
    },
  });

  // Verify email with OTP
  const verifyEmailMutation = useMutation({
    mutationFn: (input: { email: string; code: string }) => 
      api.post<AuthResponse>('/auth/verify-email', input),
    onSuccess: (response) => {
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast.success('Email berhasil diverifikasi!');
      
      // Use window.location for hard redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Kode OTP tidak valid');
    },
  });

  // Login with email + password
  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) => 
      api.post<AuthResponse>('/auth/login', input),
    onSuccess: (response) => {
      console.log('✅ Login verified:', response);
      queryClient.setQueryData(['auth', 'me'], response.data);
      toast.success('Login berhasil!');
      console.log('🔄 Redirecting to dashboard...');
      
      // Use window.location for hard redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    },
    onError: (error: Error) => {
      console.log('❌ Login failed:', error);
      toast.error(error.message || 'Login gagal');
    },
  });

  // Forgot password (sends OTP)
  const forgotPasswordMutation = useMutation({
    mutationFn: (input: { email: string }) => 
      api.post<MessageResponse>('/auth/forgot-password', input),
    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengirim OTP'  );
    },
  });

  // Reset password with OTP
  const resetPasswordMutation = useMutation({
    mutationFn: (input: { email: string; code: string; newPassword: string; newPasswordConfirmation: string }) => 
      api.post<MessageResponse>('/auth/reset-password', input),
    onSuccess: (response) => {
      toast.success(response.data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal reset password');
    },
  });

  // Resend OTP
  const resendOtpMutation = useMutation({
    mutationFn: (input: { email: string; type: 'SIGNUP' | 'RESET_PASSWORD' }) => 
      api.post<MessageResponse>('/auth/resend-otp', input),
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
      window.location.href = '/login';
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    
    // Registration flow
    register: registerMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    isRegisterPending: registerMutation.isPending,
    isVerifyEmailPending: verifyEmailMutation.isPending,
    
    // Login flow
    login: loginMutation.mutateAsync,
    isLoginPending: loginMutation.isPending,
    
    // Forgot password flow
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    isResetPasswordPending: resetPasswordMutation.isPending,
    
    // Utils
    resendOtp: resendOtpMutation.mutateAsync,
    isResendOtpPending: resendOtpMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
}
