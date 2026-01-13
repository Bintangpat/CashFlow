'use client';

import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Package, Loader2 } from 'lucide-react';

interface ProductFormData {
  name: string;
  sku: string;
  costPrice: string;
  sellPrice: string;
  stock: string;
}

const initialFormData: ProductFormData = {
  name: '',
  sku: '',
  costPrice: '',
  sellPrice: '',
  stock: '0',
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const { data: productsData, isLoading } = useProducts({ page, limit: 20, search: search || undefined });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsData?.data || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleAdd = async () => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        sku: formData.sku || undefined,
        costPrice: parseInt(formData.costPrice),
        sellPrice: parseInt(formData.sellPrice),
        stock: parseInt(formData.stock) || 0,
      });
      toast.success('Produk berhasil ditambahkan');
      setIsAddOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan produk');
    }
  };

  const handleEdit = async () => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: {
          name: formData.name,
          sku: formData.sku || undefined,
          costPrice: parseInt(formData.costPrice),
          sellPrice: parseInt(formData.sellPrice),
          stock: parseInt(formData.stock) || 0,
        },
      });
      toast.success('Produk berhasil diperbarui');
      setIsEditOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui produk');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Produk berhasil dihapus');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus produk');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { isActive: !currentStatus },
      });
      toast.success(`Produk ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah status');
    }
  };

  const openEditDialog = (product: typeof products[0]) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      costPrice: product.costPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock.toString(),
    });
    setIsEditOpen(true);
  };

  const resetAndClose = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Produk" icon={<Package className="h-5 w-5" />} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-card-foreground">Daftar Produk</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-background border-input"
                />
              </div>
              <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) resetAndClose(); setIsAddOpen(open); }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Tambah Produk Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Nama Produk *</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nama produk" className="bg-background border-input" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">SKU</Label>
                      <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="Kode SKU (opsional)" className="bg-background border-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-card-foreground">Harga Modal *</Label>
                        <Input type="number" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} placeholder="0" className="bg-background border-input" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-card-foreground">Harga Jual *</Label>
                        <Input type="number" value={formData.sellPrice} onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })} placeholder="0" className="bg-background border-input" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Stok Awal</Label>
                      <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" className="bg-background border-input" />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                      <Button onClick={handleAdd} disabled={createMutation.isPending || !formData.name || !formData.costPrice || !formData.sellPrice} className="bg-primary text-primary-foreground">
                        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Simpan
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {search ? `Tidak ada produk dengan kata kunci "${search}"` : 'Belum ada produk. Klik "Tambah Produk" untuk menambahkan.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Nama</TableHead>
                    <TableHead className="text-muted-foreground">SKU</TableHead>
                    <TableHead className="text-right text-muted-foreground">Modal</TableHead>
                    <TableHead className="text-right text-muted-foreground">Jual</TableHead>
                    <TableHead className="text-right text-muted-foreground">Stok</TableHead>
                    <TableHead className="text-center text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-border">
                      <TableCell className="font-medium text-card-foreground">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku || '-'}</TableCell>
                      <TableCell className="text-right text-card-foreground">{formatCurrency(product.costPrice)}</TableCell>
                      <TableCell className="text-right text-card-foreground">{formatCurrency(product.sellPrice)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.stock <= 5 ? 'destructive' : 'secondary'}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive(product.id, product.isActive)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(product.id, product.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) resetAndClose(); setIsEditOpen(open); }}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Edit Produk</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Nama Produk *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-background border-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">SKU</Label>
                <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="bg-background border-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Harga Modal *</Label>
                  <Input type="number" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} className="bg-background border-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Harga Jual *</Label>
                  <Input type="number" value={formData.sellPrice} onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })} className="bg-background border-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Stok</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="bg-background border-input" />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                <Button onClick={handleEdit} disabled={updateMutation.isPending} className="bg-primary text-primary-foreground">
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Simpan
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
