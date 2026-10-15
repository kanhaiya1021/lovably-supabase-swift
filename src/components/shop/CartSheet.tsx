import { Minus, Plus, Trash2, ShoppingBag, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { useCartVerification } from "@/lib/cart-verify";

export const FREE_SHIPPING_AT = 2999;

export function CartSheet() {
  const { lines, open, setOpen, subtotal, setQty, remove, count } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const verification = useCartVerification(lines, open);
  const verifying = verification.status === "verifying";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-6">
          <SheetTitle className="font-display text-2xl font-medium">Your basket ({count})</SheetTitle>
          <SheetDescription>
            {lines.length === 0 ? "Nothing here yet." : remaining > 0 ? `Add ${formatPrice(remaining)} more for free delivery.` : "You've unlocked free delivery."}
          </SheetDescription>
          {lines.length > 0 && <Progress value={Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100)} className="mt-2 h-1.5" />}
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
            <p>Your basket is empty.</p>
            <Button variant="outline" onClick={() => setOpen(false)}>Keep browsing</Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.variantId} className="flex gap-4 py-5">
                  <img src={l.image} alt={l.productName} className="h-24 w-20 rounded-md bg-muted object-cover" loading="lazy" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium">{l.productName}</p>
                        <p className="text-sm text-muted-foreground">{l.variantName}</p>
                      </div>
                      <p className="font-medium">{formatPrice(l.price * l.quantity, l.currency)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" aria-label="Decrease quantity" onClick={() => setQty(l.variantId, l.quantity - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm tabular-nums">{l.quantity}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" aria-label="Increase quantity" disabled={l.quantity >= Math.min(100, l.maxQuantity)} onClick={() => setQty(l.variantId, l.quantity + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button size="icon" variant="ghost" aria-label={`Remove ${l.productName}`} onClick={() => remove(l.variantId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t bg-secondary/50 p-6">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Final prices, tax and delivery are confirmed at checkout.</p>
              <Button className="w-full" size="lg" disabled>Checkout — coming soon</Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
