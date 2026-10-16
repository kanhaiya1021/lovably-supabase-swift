import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-background/20 bg-background/85 backdrop-blur support-select-none">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          Hearth & Clay
        </Link>

        {/* Centered Navigation Pill - hidden on mobile */}
        <div className="hidden md:flex">
          <nav className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-1">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md">
              Home
            </a>
            <a href="#catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md">
              Catalog
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md">
              Features
            </a>
          </nav>
        </div>

        {/* Right: Cart and Account */}
        <div className="flex items-center gap-4">
          {/* Account */}
          <Button asChild variant="ghost" size="icon" aria-label="My account">
            <Link to="/account"><User className="h-5 w-5" /></Link>
          </Button>
          {/* Cart */}
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
