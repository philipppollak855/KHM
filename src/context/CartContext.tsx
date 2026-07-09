"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";
import { getCartItemLineKey } from "@/lib/product-variants";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "khm-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored).map((i: CartItem) => ({
          ...i,
          taxRate: i.taxRate ?? 20,
        })));
      } catch {
        localStorage.removeItem(CART_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    const lineKey = getCartItemLineKey(item);
    setItems((prev) => {
      const maxStock = item.maxStock;
      const existing = prev.find((i) => getCartItemLineKey(i) === lineKey);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        const capped =
          maxStock !== undefined ? Math.min(nextQty, maxStock) : nextQty;
        if (capped <= 0) return prev;
        return prev.map((i) =>
          getCartItemLineKey(i) === lineKey
            ? { ...i, quantity: capped, maxStock: maxStock ?? i.maxStock }
            : i
        );
      }
      const capped =
        maxStock !== undefined ? Math.min(quantity, maxStock) : quantity;
      if (capped <= 0) return prev;
      return [...prev, { ...item, quantity: capped }];
    });
  };

  const removeItem = (lineKey: string) => {
    setItems((prev) => prev.filter((i) => getCartItemLineKey(i) !== lineKey));
  };

  const updateQuantity = (lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineKey);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (getCartItemLineKey(i) !== lineKey) return i;
        const capped =
          i.maxStock !== undefined ? Math.min(quantity, i.maxStock) : quantity;
        return { ...i, quantity: capped };
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export { getCartItemLineKey };
