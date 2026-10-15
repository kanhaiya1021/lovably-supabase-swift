import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ShieldCheck, AlertTriangle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { useCartVerification } from "@/lib/cart-verify";
import { formatPrice } from "@/lib/catalog";
import { addressSchema, readFunctionError, type ShippingAddress } from "@/lib/checkout";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Hearth & Clay" },
      { name: "description", content: "Enter your delivery address and place your order." },
      { property: "og:title", content: "Checkout — Hearth & Clay" },
      { property: "og:description", content: "Enter your delivery address and place your order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const FIELDS: { key: keyof ShippingAddress; label: string; full?: boolean; optional?: boolean }[] = [
  { key: "full_name", label: "Full name", full: true },
  { key: "phone", label: "Phone" },
  { key: "postal_code", label: "PIN code" },
  { key: "line1", label: "Address line 1", full: true },
  { key: "line2", label: "Address line 2", full: true, optional: true },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
];

function Checkout() {
  const navigate = useNavigate();
  const { lines, clear } = useCart();
  const realLines = lines.filter((l) => !l.demo);
  const verification = useCartVerification(realLines, true);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // One key per checkout visit: a double-click or retry never creates two orders.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke<{ order: { id: string } }>("create-order", {
      body: {
        items: realLines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        shippingAddress: { ...parsed.data, country: "IN" },
        idempotencyKey,
      },
    });
    if (error || !data?.order) {
      setServerError(error ? await readFunctionError(error) : "Could not place your order.");
      setSubmitting(false);
      return;
    }
    clear();
    navigate({ to: "/orders/$orderId", params: { orderId: data.order.id } });
  }

  if (realLines.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Your basket is empty</h1>
        <p className="mt-2 text-muted-foreground">Add something from the shop to check out.</p>
        <Button asChild className="mt-6"><Link to="/">Back to shop</Link></Button>
      </main>
    );
  }

  const canSubmit = verification.status === "verified" && !submitting;

  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[1fr_380px]">
      <form onSubmit={placeOrder} className="space-y-6" noValidate>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <h1 className="font-display text-4xl">Delivery details</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
              <Label htmlFor={f.key}>{f.label}{f.optional && <span className="text-muted-foreground"> (optional)</span>}</Label>
              <Input
                id={f.key}
                className="mt-1.5"
                value={form[f.key] ?? ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                aria-invalid={!!errors[f.key]}
              />
              {errors[f.key] && <p className="mt-1 text-sm text-destructive">{errors[f.key]}</p>}
            </div>
          ))}
        </div>
        {serverError && (
          <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {serverError}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</> : "Place order"}
        </Button>
        <p className="text-xs text-muted-foreground">Payment is not taken yet. Your items are held for 15 minutes after you place the order.</p>
      </form>

      <aside className="h-fit space-y-4 rounded-lg border bg-secondary/50 p-6">
        <h2 className="font-display text-xl">Order summary</h2>
        <ul className="space-y-3">
          {realLines.map((l) => (
            <li key={l.variantId} className="flex gap-3">
              <img src={l.image} alt={l.productName} className="h-16 w-14 rounded bg-muted object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-medium">{l.productName}</p>
                <p className="text-muted-foreground">{l.variantName} × {l.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t pt-4">
          {verification.status === "verifying" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking prices &amp; stock…</p>
          )}
          {verification.status === "verified" && (
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4" /> Verified by server</p>
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(verification.subtotal, verification.currency)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{verification.deliveryFee === 0 ? "Free" : formatPrice(verification.deliveryFee, verification.currency)}</span></div>
              <div className="flex justify-between pt-2 text-lg font-semibold"><span>Total</span><span>{formatPrice(verification.total, verification.currency)}</span></div>
            </div>
          )}
          {(verification.status === "issue" || verification.status === "error") && (
            <p className="text-sm text-destructive">{verification.message}</p>
          )}
        </div>
      </aside>
    </main>
  );
}
