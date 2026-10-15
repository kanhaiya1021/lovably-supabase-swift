import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/lib/cart";
import { formatPrice, type CatalogProduct, type CatalogVariant } from "@/lib/catalog";

function stockLabel(available: number) {
  if (available <= 0) return { text: "Sold out", variant: "secondary" as const };
  if (available <= 5) return { text: `Only ${available} left`, variant: "default" as const };
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

  const addToCart = (v: CatalogVariant = variant) => {
    add({
      variantId: v.id, productName: product.name, variantName: v.name, price: v.price,
      currency: product.currency, image: product.image, maxQuantity: v.available, demo: product.demo,
    });
    toast.success(`${product.name} added to basket`, { action: { label: "View", onClick: () => setOpen(true) } });
    setQuick(false);
  };

  return (
    <>
      <article className="group flex flex-col">
        <button onClick={() => setQuick(true)} className="relative overflow-hidden rounded-lg bg-muted" aria-label={`Quick view ${product.name}`}>
          <img src={product.image} alt={product.name} width={800} height={1008} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {stock && <Badge variant={stock.variant} className="absolute left-3 top-3">{stock.text}</Badge>}
        </button>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{first.name}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatPrice(first.price, product.currency)}</p>
            {first.compareAtPrice && <p className="text-sm text-muted-foreground line-through">{formatPrice(first.compareAtPrice, product.currency)}</p>}
          </div>
        </div>
        <Button variant="outline" className="mt-3" disabled={first.available <= 0} onClick={() => (product.variants.length > 1 ? setQuick(true) : addToCart(first))}>
          {first.available <= 0 ? "Sold out" : "Add to basket"}
        </Button>
      </article>

      <Dialog open={quick} onOpenChange={setQuick}>
        <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:grid sm:grid-cols-2">
          <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          <div className="flex flex-col gap-4 p-6">
            <DialogTitle className="font-display text-3xl font-medium">{product.name}</DialogTitle>
            <p className="text-xl">{formatPrice(variant.price, product.currency)}</p>
            <DialogDescription>{product.description}</DialogDescription>
            {product.variants.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <Button key={v.id} size="sm" variant={v.id === variant.id ? "default" : "outline"} onClick={() => setVariantId(v.id)}>{v.name}</Button>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">{variant.available > 0 ? `${variant.available} in stock` : "Currently sold out"}</p>
            <Button size="lg" className="mt-auto" disabled={variant.available <= 0} onClick={() => addToCart()}>Add to basket</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
