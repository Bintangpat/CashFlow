'use client';

import { useState } from 'react';
import { useFinance, useFinanceSummary, useCreateFinance, useDeleteFinance } from '@/hooks/useFinance';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const INCOME_CATEGORIES = ['Modal', 'Pinjaman', 'Investasi', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Sewa', 'Gaji', 'Listrik', 'Air', 'Internet', 'Bahan Baku', 'Operasional', 'Lainnya'];

interface FinanceFormData {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: string;
  notes: string;
  transactionDate: string;
}

const initialFormData: FinanceFormData = {
  type: 'EXPENSE',
  category: '',
  amount: '',
  notes: '',
  transactionDate: new Date().toISOString().split('T')[0],
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'INCOME' | 'EXPENSE'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<FinanceFormData>(initialFormData);

  const { data: financeData, isLoading } = useFinance({ 
    limit: 50, 
    type: activeTab === 'all' ? undefined : activeTab 
  });
  const { data: summary } = useFinanceSummary();
  const createMutation = useCreateFinance();
  const deleteMutation = useDeleteFinance();

  const transactions = financeData?.data || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAdd = async () => {
    try {
      await createMutation.mutateAsync({
        type: formData.type,
        category: formData.category,
        amount: parseInt(formData.amount),
        notes: formData.notes || undefined,
        transactionDate: new Date(formData.transactionDate),
      });
      toast.success(`${formData.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat`);
      setIsAddOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mencatat transaksi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Transaksi berhasil dihapus');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus transaksi');
    }
  };

  const categories = formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Keuangan" icon={<Wallet className="h-5 w-5" />} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary-foreground/80 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Pemasukan
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(summary?.totalIncome || 0)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-destructive text-destructive-foreground border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-destructive-foreground/80 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Pengeluaran
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(summary?.totalExpense || 0)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-accent text-accent-foreground border-0">
            <CardHeader className="pb-2">
              <CardDescription className="text-accent-foreground/80 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Saldo
              </CardDescription>
              <CardTitle className="text-2xl">
                {formatCurrency(summary?.balance || 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-card-foreground">Riwayat Transaksi</CardTitle>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Transaksi
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Tambah Transaksi</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Tabs 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({ ...formData, type: v as 'INCOME' | 'EXPENSE', category: '' })}
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-secondary">
                      <TabsTrigger value="EXPENSE">Pengeluaran</TabsTrigger>
                      <TabsTrigger value="INCOME">Pemasukan</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-2">
                    <Label className="text-card-foreground">Kategori *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-card-foreground">Jumlah (Rp) *</Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="100000"
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-card-foreground">Tanggal *</Label>
                    <Input
                      type="date"
                      value={formData.transactionDate}
                      onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-card-foreground">Catatan</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Catatan tambahan..."
                      rows={2}
                      className="bg-background border-input"
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Batal</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleAdd} 
                      disabled={createMutation.isPending || !formData.category || !formData.amount}
                      className="bg-primary text-primary-foreground"
                    >
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Simpan
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-4">
              <TabsList className="bg-secondary">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="INCOME">Pemasukan</TabsTrigger>
                <TabsTrigger value="EXPENSE">Pengeluaran</TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada transaksi. Klik "Tambah Transaksi" untuk mencatat.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Tanggal</TableHead>
                    <TableHead className="text-muted-foreground">Tipe</TableHead>
                    <TableHead className="text-muted-foreground">Kategori</TableHead>
                    <TableHead className="text-muted-foreground">Catatan</TableHead>
                    <TableHead className="text-right text-muted-foreground">Jumlah</TableHead>
                    <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-border">
                      <TableCell className="text-card-foreground">{formatDate(tx.transactionDate)}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'INCOME' ? 'default' : 'destructive'}>
                          {tx.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-card-foreground">{tx.category}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.notes || '-'}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'INCOME' ? 'text-primary' : 'text-destructive'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
