'use client';

import { useState } from 'react';
import { useProfitLoss } from '@/hooks/useAnalytics';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign
} from 'lucide-react';

export default function ReportsPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  const { data: profitLoss, isLoading } = useProfitLoss(startDate, endDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getMonthName = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }
    return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Laporan" icon={<BarChart3 className="h-5 w-5" />} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Filter */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Filter Periode</CardTitle>
            <CardDescription className="text-muted-foreground">Pilih rentang tanggal untuk laporan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-card-foreground">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-44 bg-background border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-card-foreground">Tanggal Akhir</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-44 bg-background border-input"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setStartDate(today.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                  }}
                >
                  Hari Ini
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    setStartDate(firstDay.toISOString().split('T')[0]);
                    setEndDate(lastDay.toISOString().split('T')[0]);
                  }}
                >
                  Bulan Ini
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), 0, 1);
                    setStartDate(firstDay.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                  }}
                >
                  Tahun Ini
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit & Loss Report */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              Laporan Laba Rugi
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Periode: {getMonthName()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : profitLoss ? (
              <div className="space-y-6">
                {/* Revenue */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-card-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Pendapatan
                  </h3>
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between py-2 border-b border-dashed border-border">
                      <span className="text-muted-foreground">Penjualan</span>
                      <span className="font-medium text-card-foreground">{formatCurrency(profitLoss.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed border-border">
                      <span className="text-muted-foreground">Pendapatan Lain (Modal, dll)</span>
                      <span className="font-medium text-card-foreground">{formatCurrency(profitLoss.otherIncome)}</span>
                    </div>
                    <div className="flex justify-between py-2 bg-primary/10 px-3 rounded">
                      <span className="font-semibold text-primary">Total Pendapatan</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(profitLoss.totalRevenue + profitLoss.otherIncome)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Expenses */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-card-foreground">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    Pengeluaran
                  </h3>
                  <div className="pl-7 space-y-2">
                    <div className="flex justify-between py-2 border-b border-dashed border-border">
                      <span className="text-muted-foreground">HPP (Harga Pokok Penjualan)</span>
                      <span className="font-medium text-card-foreground">{formatCurrency(profitLoss.totalRevenue - profitLoss.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed border-border">
                      <span className="text-muted-foreground">Beban Operasional</span>
                      <span className="font-medium text-card-foreground">{formatCurrency(profitLoss.expenses)}</span>
                    </div>
                    <div className="flex justify-between py-2 bg-destructive/10 px-3 rounded">
                      <span className="font-semibold text-destructive">Total Pengeluaran</span>
                      <span className="font-bold text-destructive">
                        {formatCurrency((profitLoss.totalRevenue - profitLoss.grossProfit) + profitLoss.expenses)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Net Profit */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-card-foreground">
                    <Minus className="h-5 w-5 text-accent-foreground" />
                    Laba/Rugi Bersih
                  </h3>
                  <div className="pl-7">
                    <div className={`flex justify-between py-4 px-4 rounded-lg ${
                      profitLoss.netProfit >= 0 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-destructive text-destructive-foreground'
                    }`}>
                      <span className="font-bold text-lg">
                        {profitLoss.netProfit >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
                      </span>
                      <span className="font-bold text-lg">
                        {formatCurrency(Math.abs(profitLoss.netProfit))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-primary">Laba Kotor</CardDescription>
                      <CardTitle className="text-primary">{formatCurrency(profitLoss.grossProfit)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-accent/20 bg-accent/10">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-accent-foreground">Margin Kotor</CardDescription>
                      <CardTitle className="text-accent-foreground">
                        {profitLoss.totalRevenue > 0 
                          ? ((profitLoss.grossProfit / profitLoss.totalRevenue) * 100).toFixed(1) 
                          : 0}%
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-secondary bg-secondary/50">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-secondary-foreground">Margin Bersih</CardDescription>
                      <CardTitle className="text-secondary-foreground">
                        {profitLoss.totalRevenue > 0 
                          ? ((profitLoss.netProfit / profitLoss.totalRevenue) * 100).toFixed(1) 
                          : 0}%
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada data untuk periode ini
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
