import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CartLine = {
  variantId: string;
  productName: string;
  variantName: string;
  /** Display-only price. The server must re-price at checkout. */
  price: number;
  currency: string;
  image: string;
  quantity: number;
  maxQuantity: number;
  demo: boolean;
};

export const MAX_QTY = 100;
const STORAGE_KEY = "shop-cart-v1";

export function clampQty(qty: number, max: number) {
  return Math.max(0, Math.min(qty, Math.min(MAX_QTY, max)));
}

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

async function syncLine(variantId: string, qty: number) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;
  let { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
  if (!cart) {
    const ins = await supabase.from("carts").insert({ user_id: user.id }).select("id").single();
    cart = ins.data;
  }
  if (!cart) return;
  if (qty <= 0) {
    await supabase.from("cart_items").delete().eq("cart_id", cart.id).eq("variant_id", variantId);
  } else {
    await supabase.from("cart_items").upsert({ cart_id: cart.id, variant_id: variantId, quantity: qty }, { onConflict: "cart_id,variant_id" });
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch { /* ignore corrupt storage */ }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (loaded.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const update = useCallback((variantId: string, fn: (l: CartLine | undefined) => CartLine | null) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variantId);
      const next = fn(existing);
      const rest = prev.filter((l) => l.variantId !== variantId);
      const result = next && next.quantity > 0 ? (existing ? prev.map((l) => (l.variantId === variantId ? next : l)) : [...prev, next]) : rest;
      const line = next ?? existing;
      if (line && !line.demo) void syncLine(variantId, next?.quantity ?? 0);
      return result;
    });
  }, []);

  const value = useMemo<CartCtx>(() => ({
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + l.price * l.quantity, 0),
    open,
    setOpen,
    add: (line, qty = 1) => update(line.variantId, (ex) => ({ ...line, quantity: clampQty((ex?.quantity ?? 0) + qty, line.maxQuantity) })),
    setQty: (id, qty) => update(id, (ex) => (ex ? { ...ex, quantity: clampQty(qty, ex.maxQuantity) } : null)),
    remove: (id) => update(id, (ex) => (ex ? { ...ex, quantity: 0 } : null)),
    clear: () => { lines.forEach((l) => !l.demo && void syncLine(l.variantId, 0)); setLines([]); },
  }), [lines, open, update]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
