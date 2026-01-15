'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCreateSale } from '@/hooks/useSales';
import { useCartStore } from '@/store/useCartStore';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Loader2,
  Check,
  Receipt
} from 'lucide-react';

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastSale, setLastSale] = useState<{ id: string; total: number } | null>(null);

  const { data: productsData, isLoading } = useProducts({ 
    limit: 100, 
    search: search || undefined,
    active: 'true'
  });
  const createSaleMutation = useCreateSale();

  const { 
    items: cartItems, 
    addItem, 
    removeItem, 
    incrementQuantity, 
    decrementQuantity, 
    clearCart,
    getTotal,
    getItemCount
  } = useCartStore();

  const products = productsData?.data || [];
  const total = getTotal();
  const itemCount = getItemCount();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = (product: typeof products[0]) => {
    const cartItem = cartItems.find((item) => item.id === product.id);
    const currentQty = cartItem?.quantity || 0;

    if (currentQty >= product.stock) {
      toast.error(`Stok "${product.name}" tidak cukup`);
      return;
    }

    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    try {
      const response = await createSaleMutation.mutateAsync({
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      setLastSale({ id: response.data.id, total: response.data.totalAmount });
      setIsCheckoutOpen(true);
      clearCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memproses transaksi');
    }
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setLastSale(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Kasir (POS)" icon={<ShoppingCart className="h-5 w-5" />} />

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Product Grid */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-input"
            />
          </div>

          {/* Products Grid */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {search ? 'Produk tidak ditemukan' : 'Belum ada produk'}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product) => (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow bg-card border-border hover:border-primary ${
                      product.stock === 0 ? 'opacity-50' : ''
                    }`}
                    onClick={() => product.stock > 0 && handleAddToCart(product)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-1 truncate text-card-foreground">{product.name}</h3>
                      <p className="text-lg font-bold text-primary">{formatCurrency(product.sellPrice)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'} className="text-xs">
                          Stok: {product.stock}
                        </Badge>
                        {product.stock > 0 && (
                          <Plus className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-card border-l border-border flex flex-col">
          <CardHeader className="shrink-0 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <ShoppingCart className="h-5 w-5" />
              Keranjang
              {itemCount > 0 && (
                <Badge className="ml-auto bg-primary text-primary-foreground">{itemCount} item</Badge>
              )}
            </CardTitle>
          </CardHeader>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Keranjang kosong
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate text-secondary-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.sellPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => decrementQuantity(item.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium text-card-foreground">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => {
                          if (item.quantity < item.stock) {
                            incrementQuantity(item.id);
                          } else {
                            toast.error('Stok tidak cukup');
                          }
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Checkout */}
          <div className="shrink-0 border-t border-border p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold text-card-foreground">{formatCurrency(total)}</span>
            </div>
            <Separator className="bg-border" />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={clearCart}
                disabled={cartItems.length === 0}
              >
                Batal
              </Button>
              <Button 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || createSaleMutation.isPending}
              >
                {createSaleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Bayar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={closeCheckout}>
        <DialogContent className="text-center bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-4 text-card-foreground">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
              Transaksi Berhasil!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Total Pembayaran</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(lastSale?.total || 0)}
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeCheckout} className="flex-1">
              <Receipt className="h-4 w-4 mr-2" />
              Cetak Struk
            </Button>
            <Button onClick={closeCheckout} className="flex-1 bg-primary text-primary-foreground">
              Transaksi Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
