'use client';

import { useDashboard } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  ShoppingCart, 
  Package, 
  Wallet, 
  BarChart3, 
  LogOut, 
  TrendingUp, 
  AlertTriangle,
  Loader2,
  Truck
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();

  const isLoading = authLoading || dashboardLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const menuItems = [
    {
      title: 'Kasir (POS)',
      description: 'Transaksi penjualan',
      icon: ShoppingCart,
      href: '/pos',
    },
    {
      title: 'Produk',
      description: 'Kelola produk & stok',
      icon: Package,
      href: '/products',
    },
    {
      title: 'Terima Barang',
      description: 'Tambah stok dari supplier',
      icon: Truck,
      href: '/stock-receiving',
    },
    {
      title: 'Keuangan',
      description: 'Pemasukan & pengeluaran',
      icon: Wallet,
      href: '/finance',
    },
    {
      title: 'Laporan',
      description: 'Analisis & statistik',
      icon: BarChart3,
      href: '/reports',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl font-bold text-card-foreground">CashFlow</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => logout()}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Selamat Datang! 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Ringkasan bisnis Anda hari ini
          </p>
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary-foreground/80 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Penjualan Hari Ini
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(dashboard?.today.totalSales || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-primary-foreground/80 text-sm">
                {dashboard?.today.transactionCount || 0} transaksi
              </p>
            </CardContent>
          </Card>

          <Card className="bg-accent text-accent-foreground border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-accent-foreground/80 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Laba Hari Ini
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(dashboard?.today.totalProfit || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-accent-foreground/80 text-sm">
                Dari penjualan produk
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Produk
              </CardDescription>
              <CardTitle className="text-2xl text-card-foreground">
                {dashboard?.products.active || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground text-sm">
                {dashboard?.products.total || 0} total produk
              </p>
            </CardContent>
          </Card>

          <Card className={`border-0 ${(dashboard?.products.lowStock || 0) > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-card border-border'}`}>
            <CardHeader className="pb-2">
              <CardDescription className={`flex items-center gap-2 ${(dashboard?.products.lowStock || 0) > 0 ? 'text-destructive-foreground/80' : 'text-muted-foreground'}`}>
                <AlertTriangle className="h-4 w-4" />
                Stok Menipis
              </CardDescription>
              <CardTitle className={`text-2xl ${(dashboard?.products.lowStock || 0) > 0 ? '' : 'text-card-foreground'}`}>
                {dashboard?.products.lowStock || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className={`text-sm ${(dashboard?.products.lowStock || 0) > 0 ? 'text-destructive-foreground/80' : 'text-muted-foreground'}`}>
                Produk stok ≤ 5
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Penjualan 7 Hari Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.chart && dashboard.chart.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.chart.map((day) => {
                    const maxSales = Math.max(...dashboard.chart.map(d => d.sales), 1);
                    const percentage = (day.sales / maxSales) * 100;
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    
                    return (
                      <div key={day.date} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-muted-foreground">
                          <div className="font-medium">{dayName}</div>
                          <div className="text-xs">{dateStr}</div>
                        </div>
                        <div className="flex-1 h-8 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full flex items-center justify-end pr-3"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            {percentage > 20 && (
                              <span className="text-xs text-primary-foreground font-medium">
                                {formatCurrency(day.sales)}
                              </span>
                            )}
                          </div>
                        </div>
                        {percentage <= 20 && (
                          <span className="text-xs text-muted-foreground w-24 text-right">
                            {formatCurrency(day.sales)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada data penjualan
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Produk Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.topProducts && dashboard.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-primary text-primary-foreground' :
                        index === 1 ? 'bg-secondary text-secondary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-card-foreground">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">{product.totalSold} terjual</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada data penjualan
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {menuItems.map((item) => (
            <Link href={item.href} key={item.href}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full bg-card border-border hover:border-primary">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
