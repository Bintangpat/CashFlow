'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { Loader2, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

type RegisterStep = 'form' | 'otp';

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterContent />
    </PublicRoute>
  );
}

function RegisterContent() {
  const { 
    register,
    verifyEmail,
    resendOtp,
    isRegisterPending,
    isVerifyEmailPending,
    isResendOtpPending
  } = useAuth();
  
  const [step, setStep] = useState<RegisterStep>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ email, password, passwordConfirmation });
      setStep('otp');
      setCountdown(60);
    } catch {
      // Error handled by mutation
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, '');
      setOtp(newOtp);
      
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;

    try {
      await verifyEmail({ email, code });
      // Redirect handled by useAuth hook
    } catch {
      // Error handled by mutation
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email, type: 'SIGNUP' });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch {
      // Error handled by mutation
    }
  };

  const goBack = () => {
    setStep('form');
    setOtp(['', '', '', '', '', '']);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            💰 CashFlow
          </h1>
          <p className="text-muted-foreground">
            Keuangan Bisnis & Point of Sales
          </p>
        </div>

        <Card className="border-border bg-card">
          {step === 'form' ? (
            <form onSubmit={handleRegisterSubmit}>
              <CardHeader>
                <CardTitle className="text-card-foreground">Buat Akun Baru</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Daftarkan akun Anda untuk memulai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-card-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@bisnis.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-card-foreground">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background border-input text-foreground pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min. 8 karakter, huruf besar, kecil, dan angka
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation" className="text-card-foreground">Konfirmasi Password</Label>
                  <div className="relative">
                    <Input
                      id="passwordConfirmation"
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      placeholder="Ketik ulang password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      required
                      className="bg-background border-input text-foreground pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isRegisterPending || !email || !password || !passwordConfirmation}
                >
                  {isRegisterPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Daftar & Kirim OTP
                    </>
                  )}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Masuk
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <CardHeader>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={goBack}
                  className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Kembali
                </Button>
                <CardTitle className="text-card-foreground">Verifikasi Email</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Masukkan kode 6 digit yang dikirim ke <span className="text-primary">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-background border-input text-foreground"
                    />
                  ))}
                </div>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Kirim ulang dalam <span className="text-primary">{countdown}s</span>
                    </p>
                  ) : (
                    <Button 
                      type="button"
                      variant="link" 
                      onClick={handleResendOtp}
                      disabled={isResendOtpPending}
                      className="text-primary hover:text-primary/80"
                    >
                      {isResendOtpPending ? 'Mengirim...' : 'Kirim ulang kode'}
                    </Button>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!isOtpComplete || isVerifyEmailPending}
                >
                  {isVerifyEmailPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    'Verifikasi & Masuk'
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          © 2026 CashFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
