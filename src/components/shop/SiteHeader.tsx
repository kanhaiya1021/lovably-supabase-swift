import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Store } from "lucide-react";
import { useCart } from "@/lib/cart";

export function SiteHeader({ initialQuery }: { initialQuery?: string | undefined }) {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState(initialQuery ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q: q.trim() || undefined }, hash: "catalog" });
  };

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:gap-6 sm:px-6">
        <Link to="/" className="flex shrink-0 flex-col leading-none">
          <span className="font-display text-xl font-semibold italic tracking-tight sm:text-2xl">Hearth & Clay</span>
          <span className="hidden text-[10px] italic opacity-90 sm:block">
            Explore <span className="font-semibold text-highlight">Handmade</span> ✦
          </span>
        </Link>

        <form onSubmit={submit} className="flex min-w-0 flex-1 max-w-2xl">
          <div className="flex w-full items-center rounded-md bg-card shadow-sm">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for mugs, throws, candles and more"
              aria-label="Search products"
              className="h-10 min-w-0 flex-1 rounded-l-md bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" aria-label="Search" className="flex h-10 w-11 items-center justify-center text-primary">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-4">
          <Link to="/account" aria-label="My account" className="flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold hover:bg-primary-foreground/10">
            <User className="h-5 w-5" />
            <span className="hidden md:inline">Account</span>
          </Link>
          <a href="/#catalog" className="hidden items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold hover:bg-primary-foreground/10 lg:flex">
            <Store className="h-5 w-5" /> Shop
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label={`Open basket, ${count} items`}
            className="relative flex items-center gap-1.5 rounded-md px-2 py-2 text-sm font-semibold hover:bg-primary-foreground/10"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden md:inline">Basket</span>
            {count > 0 && (
              <span className="absolute -top-0.5 left-4 flex h-4 min-w-4 items-center justify-center rounded-full bg-highlight px-1 text-[10px] font-bold text-highlight-foreground">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
