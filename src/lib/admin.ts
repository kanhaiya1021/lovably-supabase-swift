import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export const ORDER_STATUSES: OrderStatus[] = [
  "pending", "awaiting_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded",
];
/** Orders in these states count as real revenue. */
export const REVENUE_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];
export const LOW_STOCK = 5;

export const statusLabel = (s: string) => s.replace(/_/g, " ");

export function adminHead(title: string) {
  const t = `${title} — Hearth & Clay Admin`;
  return {
    meta: [
      { title: t },
      { name: "description", content: `${title} for the Hearth & Clay store admin.` },
      { property: "og:title", content: t },
      { property: "og:description", content: `${title} for the Hearth & Clay store admin.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  };
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
  });
}

export const one = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined);

/** Coupon discount on a subtotal; mirrors the rule the server must enforce. */
export function couponDiscount(
  c: { discount_type: "percent" | "fixed"; discount_value: number; max_discount: number | null; min_order_amount: number },
  subtotal: number,
) {
  if (subtotal < c.min_order_amount) return 0;
  let d = c.discount_type === "percent" ? (subtotal * c.discount_value) / 100 : c.discount_value;
  if (c.max_discount != null) d = Math.min(d, c.max_discount);
  return Math.round(Math.min(d, subtotal) * 100) / 100;
}
