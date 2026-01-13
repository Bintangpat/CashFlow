'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useStockReceivings, useCreateStockReceiving } from '@/hooks/useStockReceiving';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Package, Loader2, Truck, Receipt } from 'lucide-react';

interface FormData {
  productId: string;
  quantity: string;
  costPerItem: string;
  notes: string;
}

const initialFormData: FormData = {
  productId: '',
  quantity: '',
  costPerItem: '',
  notes: '',
};

export default function StockReceivingPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { data: productsData } = useProducts({ limit: 100 });
  const { data: receivingsData, isLoading } = useStockReceivings();
  const createMutation = useCreateStockReceiving();

  const products = productsData?.data || [];
  const receivings = receivingsData?.data || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const totalCost = parseInt(formData.quantity || '0') * parseInt(formData.costPerItem || '0');

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        costPerItem: parseInt(formData.costPerItem),
        notes: formData.notes || undefined,
      });
      toast.success('Barang berhasil diterima! Stok dan saldo telah diperbarui.');
      setIsAddOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menerima barang');
    }
  };

  const resetAndClose = () => {
    setFormData(initialFormData);
    setIsAddOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Terima Barang" icon={<Truck className="h-5 w-5" />} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-card-foreground">Fitur Terima Barang</p>
                <p className="text-sm text-muted-foreground">
                  Saat menerima barang, stok produk akan bertambah dan saldo keuangan akan berkurang secara otomatis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Riwayat Penerimaan Barang</CardTitle>
              <CardDescription className="text-muted-foreground">Daftar semua penerimaan barang dari supplier</CardDescription>
            </div>
            <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) resetAndClose(); else setIsAddOpen(true); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Terima Barang
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-card-foreground">Terima Barang Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Pilih Produk *</Label>
                    <Select 
                      value={formData.productId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Pilih produk..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {product.name}
                              {product.sku && <span className="text-muted-foreground">({product.sku})</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProduct && (
                    <div className="p-3 bg-secondary rounded-lg text-sm">
                      <p className="text-secondary-foreground">Stok saat ini: <span className="font-medium">{selectedProduct.stock}</span></p>
                      <p className="text-secondary-foreground">Harga modal terakhir: <span className="font-medium">{formatCurrency(selectedProduct.costPrice)}</span></p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-card-foreground">Jumlah *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="0"
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerItem" className="text-card-foreground">Harga per Item *</Label>
                      <Input
                        id="costPerItem"
                        type="number"
                        min="0"
                        value={formData.costPerItem}
                        onChange={(e) => setFormData(prev => ({ ...prev, costPerItem: e.target.value }))}
                        placeholder="0"
                        className="bg-background border-input"
                      />
                    </div>
                  </div>

                  {totalCost > 0 && (
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total biaya yang akan dikurangi dari saldo:</p>
                      <p className="text-xl font-bold text-destructive">{formatCurrency(totalCost)}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-card-foreground">Catatan (opsional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Contoh: Pembelian dari Supplier ABC"
                      rows={2}
                      className="bg-background border-input"
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Batal</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={createMutation.isPending || !formData.productId || !formData.quantity || !formData.costPerItem}
                      className="bg-primary text-primary-foreground"
                    >
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Terima Barang
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : receivings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada riwayat penerimaan barang.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Tanggal</TableHead>
                    <TableHead className="text-muted-foreground">Produk</TableHead>
                    <TableHead className="text-right text-muted-foreground">Qty</TableHead>
                    <TableHead className="text-right text-muted-foreground">Harga/Item</TableHead>
                    <TableHead className="text-right text-muted-foreground">Total Biaya</TableHead>
                    <TableHead className="text-muted-foreground">Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivings.map((receiving) => (
                    <TableRow key={receiving.id} className="border-border">
                      <TableCell className="whitespace-nowrap text-card-foreground">{formatDate(receiving.receivedAt)}</TableCell>
                      <TableCell className="font-medium text-card-foreground">{receiving.product.name}</TableCell>
                      <TableCell className="text-right text-primary">+{receiving.quantity}</TableCell>
                      <TableCell className="text-right text-card-foreground">{formatCurrency(receiving.costPerItem)}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        -{formatCurrency(receiving.totalCost)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{receiving.notes || '-'}</TableCell>
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
