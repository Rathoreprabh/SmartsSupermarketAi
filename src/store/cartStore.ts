import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  image: string | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (item: CartItem) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          const newItems = [...state.items, item];
          return {
            items: newItems,
            itemCount: newItems.length,
            total: get().calculateTotal(),
          };
        }),

      removeItem: (productId: string) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.productId !== productId);
          return {
            items: newItems,
            itemCount: newItems.length,
            total: get().calculateTotal(),
          };
        }),

      updateQuantity: (productId: string, quantity: number) =>
        set((state) => {
          const newItems =
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                );

          return {
            items: newItems,
            itemCount: newItems.length,
            total: get().calculateTotal(),
          };
        }),

      clearCart: () =>
        set({
          items: [],
          itemCount: 0,
          total: 0,
        }),

      calculateTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          return total + parseFloat(item.price) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-store',
    }
  )
);
