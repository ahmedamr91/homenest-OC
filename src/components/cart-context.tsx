"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  colorId: number | null;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  colorName: string;
  colorHex: string;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (productId: number, colorId: number | null) => void;
  setQty: (productId: number, colorId: number | null, qty: number) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "homenest_cart_v1";

const sameLine = (a: CartItem, productId: number, colorId: number | null) =>
  a.productId === productId && a.colorId === colorId;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((p) =>
          sameLine(p, item.productId, item.colorId)
        );
        if (existing) {
          return prev.map((p) =>
            sameLine(p, item.productId, item.colorId)
              ? { ...p, quantity: Math.min(p.quantity + qty, p.maxStock, 99) }
              : p
          );
        }
        return [
          ...prev,
          { ...item, quantity: Math.min(qty, item.maxStock || 99, 99) },
        ];
      });
    },
    []
  );

  const remove = useCallback((productId: number, colorId: number | null) => {
    setItems((prev) =>
      prev.filter((p) => !sameLine(p, productId, colorId))
    );
  }, []);

  const setQty = useCallback(
    (productId: number, colorId: number | null, qty: number) => {
      setItems((prev) =>
        prev.map((p) =>
          sameLine(p, productId, colorId)
            ? { ...p, quantity: Math.max(1, Math.min(qty, p.maxStock || 99, 99)) }
            : p
        )
      );
    },
    []
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextType>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { items, count, subtotal, add, remove, setQty, clear, ready };
  }, [items, add, remove, setQty, clear, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
