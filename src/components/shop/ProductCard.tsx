import { toast } from "sonner";
import { Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatPrice, type CatalogProduct } from "@/lib/catalog";

export function discountOf(price: number, compareAt: number | null) {
  return compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : null;
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const first = product.variants[0];
  const { add, setOpen } = useCart();
  if (!first) return null;
  const off = discountOf(first.price, first.compareAtPrice);
  const soldOut = first.available <= 0;

  const quickAdd = () => {
    add({
      variantId: first.id, productName: product.name, variantName: first.name, price: first.price,
      currency: product.currency, image: product.image, maxQuantity: first.available, demo: product.demo,
    });
    toast.success(`${product.name} added to basket`, { action: { label: "View basket", onClick: () => setOpen(true) } });
  };

  return (
    <article className="group relative flex flex-col bg-card p-4 transition-shadow hover:z-10 hover:shadow-xl">
      <div className="relative mx-auto aspect-square w-full overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy" width={400} height={400}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${soldOut ? "opacity-50" : ""}`} />
        {soldOut && (
          <span className="absolute inset-x-0 bottom-2 mx-auto w-fit rounded-sm bg-foreground/80 px-2 py-0.5 text-xs font-semibold text-background">Sold out</span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-medium group-hover:text-primary">
        <Link to="/products/$productId" params={{ productId: product.id }} className="after:absolute after:inset-0">
          {product.name}
        </Link>
      </h3>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-0.5 rounded-sm bg-success px-1.5 py-0.5 font-semibold text-success-foreground">
          4.4 <Star className="h-3 w-3 fill-current" />
        </span>
        <span className="font-medium text-muted-foreground">(24)</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-base font-semibold">{formatPrice(first.price, product.currency)}</span>
        {off && (
          <>
            <span className="text-xs text-muted-foreground line-through">{formatPrice(first.compareAtPrice!, product.currency)}</span>
            <span className="text-xs font-semibold text-success">{off}% off</span>
          </>
        )}
      </div>
      {first.available > 0 && first.available <= 5 && (
        <p className="mt-1 text-xs font-medium text-destructive">Only {first.available} left</p>
      )}
      {first.price >= 2999 && <p className="mt-1 text-xs text-muted-foreground">Free delivery</p>}
      {!soldOut && product.variants.length === 1 && (
        <button onClick={quickAdd}
          className="relative z-20 mt-3 hidden rounded-sm bg-highlight py-2 text-xs font-semibold text-highlight-foreground group-hover:block">
          ADD TO BASKET
        </button>
      )}
    </article>
  );
}
