import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CartLine } from "@/lib/cart";

export type CartVerification =
  | { status: "idle" }
  | { status: "verifying" }
  | { status: "verified"; subtotal: number; deliveryFee: number; total: number; currency: string }
  | { status: "issue"; message: string }
  | { status: "error"; message: string };

type VerifyResponse = {
  valid: boolean;
  message?: string;
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  currency?: string;
};

/**
 * Verifies non-demo cart lines against the `calculate-cart` Edge Function
 * whenever the drawer opens or quantities change (debounced).
 */
export function useCartVerification(lines: CartLine[], active: boolean): CartVerification {
  const [state, setState] = useState<CartVerification>({ status: "idle" });

  const realLines = lines.filter((l) => !l.demo && l.quantity > 0);
  const fingerprint = realLines.map((l) => `${l.variantId}:${l.quantity}`).join(",");

  useEffect(() => {
    if (!active || realLines.length === 0) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "verifying" });
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke<VerifyResponse>("calculate-cart", {
        body: { items: realLines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })) },
      });
      if (cancelled) return;
      if (error) {
        setState({ status: "error", message: "Could not reach the server. Try again." });
      } else if (data?.valid) {
        setState({
          status: "verified",
          subtotal: data.subtotal ?? 0,
          deliveryFee: data.deliveryFee ?? 0,
          total: data.total ?? 0,
          currency: data.currency ?? "INR",
        });
      } else {
        setState({ status: "issue", message: data?.message ?? "Some items need attention." });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fingerprint]);

  return state;
}
