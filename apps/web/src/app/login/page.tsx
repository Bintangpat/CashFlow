'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

type AuthStep = 'email' | 'otp';
type AuthType = 'login' | 'register';

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginContent />
    </PublicRoute>
  );
}

function LoginContent() {
  const { 
    requestSignup, 
    verifySignup, 
    requestLogin, 
    verifyLogin,
    resendOtp,
    isRequestSignupPending,
    isVerifySignupPending,
    isRequestLoginPending,
    isVerifyLoginPending,
    isResendOtpPending
  } = useAuth();
  
  const [authType, setAuthType] = useState<AuthType>('login');
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authType === 'register') {
        await requestSignup({ email });
      } else {
        await requestLogin({ email });
      }
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
      if (authType === 'register') {
        await verifySignup({ email, code });
      } else {
        await verifyLogin({ email, code });
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email, type: authType === 'register' ? 'SIGNUP' : 'LOGIN' });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch {
      // Error handled by mutation
    }
  };

  const goBack = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const isLoading = isRequestSignupPending || isVerifySignupPending || isRequestLoginPending || isVerifyLoginPending;

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
          {step === 'email' ? (
            <Tabs value={authType} onValueChange={(v) => setAuthType(v as AuthType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Masuk
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Daftar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleEmailSubmit}>
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Masuk ke Akun</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Masukkan email Anda untuk menerima kode OTP
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-card-foreground">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@bisnis.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background border-input text-foreground"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isRequestLoginPending || !email}
                    >
                      {isRequestLoginPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Kirim Kode OTP
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleEmailSubmit}>
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Buat Akun Baru</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Daftarkan email Anda untuk memulai
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-card-foreground">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@bisnis.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background border-input text-foreground"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isRequestSignupPending || !email}
                    >
                      {isRequestSignupPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Daftar & Kirim OTP
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
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
                <CardTitle className="text-card-foreground">Verifikasi OTP</CardTitle>
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
                  disabled={!isOtpComplete || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    'Verifikasi'
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
