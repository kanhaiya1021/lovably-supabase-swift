import { useState } from "react";
import { toast } from "sonner";
import { Eye, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/lib/cart";
import { formatPrice, type CatalogProduct, type CatalogVariant } from "@/lib/catalog";

function stockLabel(available: number) {
  if (available <= 0) return { text: "Sold out", variant: "secondary" as const, bg: "bg-muted text-muted-foreground" };
  if (available <= 5) return { text: `Only ${available} left`, variant: "default" as const, bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" };
  return null;
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const first = product.variants[0];
  if (!first) return null;
  return <ProductCardInner product={product} first={first} />;
}

function ProductCardInner({ product, first }: { product: CatalogProduct; first: CatalogVariant }) {
  const { add, setOpen } = useCart();
  const [quick, setQuick] = useState(false);
  const [variantId, setVariantId] = useState(first.id);
  const variant = product.variants.find((v) => v.id === variantId) ?? first;
  const stock = stockLabel(first.available);

  const discountPercent = first.compareAtPrice && first.compareAtPrice > first.price
    ? Math.round(((first.compareAtPrice - first.price) / first.compareAtPrice) * 100)
    : null;

  const addToCart = (v: CatalogVariant = variant) => {
    add({
      variantId: v.id,
      productName: product.name,
      variantName: v.name,
      price: v.price,
      currency: product.currency,
      image: product.image,
      maxQuantity: v.available,
      demo: product.demo,
    });
    toast.success(`${product.name} added to basket`, {
      action: { label: "View basket", onClick: () => setOpen(true) },
    });
    setQuick(false);
  };

  return (
    <>
      <article className="group relative flex flex-col rounded-2xl border border-border/40 bg-card p-3 shadow-xs transition-all duration-300 hover:border-border hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/50">
          <img
            src={product.image}
            alt={product.name}
            width={800}
            height={1000}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
            {discountPercent && (
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            {stock && (
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md ${stock.bg}`}>
                {stock.text}
              </span>
            )}
          </div>

          {/* Quick Action Floating Overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setQuick(true)}
              className="gap-2 rounded-full shadow-md backdrop-blur-md hover:scale-105 transition-transform"
            >
              <Eye className="h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 flex flex-1 flex-col">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium text-foreground">4.9</span>
              <span className="text-muted-foreground">(24)</span>
            </div>
            {product.variants.length > 1 && (
              <span className="text-[11px] font-medium text-muted-foreground">
                {product.variants.length} options
              </span>
            )}
          </div>

          <h3 className="mt-2 font-display text-base font-medium leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            <Link to="/products/$productId" params={{ productId: product.id }} className="after:absolute after:inset-0 after:content-['']">{product.name}</Link>
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-semibold text-base">
              {formatPrice(first.price, product.currency)}
            </span>
            {first.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(first.compareAtPrice, product.currency)}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="relative z-20 mt-3 w-full gap-2 rounded-lg font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            disabled={first.available <= 0}
            onClick={() => (product.variants.length > 1 ? setQuick(true) : addToCart(first))}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {first.available <= 0 ? "Sold out" : "Add to basket"}
          </Button>
        </div>
      </article>

      {/* Quick View Modal */}
      <Dialog open={quick} onOpenChange={setQuick}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 rounded-2xl sm:grid sm:grid-cols-2">
          <div className="relative aspect-[4/5] bg-muted sm:aspect-auto">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-4 p-6">
            <div>
              <DialogTitle className="font-display text-2xl font-semibold">{product.name}</DialogTitle>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatPrice(variant.price, product.currency)}</span>
                {variant.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(variant.compareAtPrice, product.currency)}
                  </span>
                )}
              </div>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </DialogDescription>
            {product.variants.length > 1 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Button
                      key={v.id}
                      size="sm"
                      variant={v.id === variant.id ? "default" : "outline"}
                      onClick={() => setVariantId(v.id)}
                      className="rounded-full"
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs font-medium text-muted-foreground">
              {variant.available > 0 ? `✓ ${variant.available} units in stock` : "Currently sold out"}
            </p>
            <Button
              size="lg"
              className="mt-auto w-full gap-2 rounded-xl font-medium"
              disabled={variant.available <= 0}
              onClick={() => addToCart()}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to basket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
