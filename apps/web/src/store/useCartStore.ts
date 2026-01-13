import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  costPrice: number;
  sellPrice: number;
  stock: number;
  isActive: boolean;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product: Product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        // Increment quantity if item exists
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.sellPrice,
                }
              : item
          ),
        };
      }

      // Add new item
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        subtotal: product.sellPrice,
      };

      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity < 1) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.sellPrice,
            }
          : item
      ),
    }));
  },

  incrementQuantity: (productId: string) => {
    const item = get().items.find((i) => i.id === productId);
    if (item) {
      get().updateQuantity(productId, item.quantity + 1);
    }
  },

  decrementQuantity: (productId: string) => {
    const item = get().items.find((i) => i.id === productId);
    if (item) {
      get().updateQuantity(productId, item.quantity - 1);
    }
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
