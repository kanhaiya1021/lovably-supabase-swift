import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight">Hearth&nbsp;&amp;&nbsp;Clay</Link>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="My account">
            <Link to="/account"><User className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" aria-label={`Open basket, ${count} items`} onClick={() => setOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
