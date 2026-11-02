import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, Minus, Plus, ShoppingCart, Truck, ShieldCheck, RotateCcw, Star, Tag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { CartSheet } from "@/components/shop/CartSheet";
import { useCart, MAX_QTY } from "@/lib/cart";
import { catalogQuery, formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ context, params }) => {
    const catalog = await context.queryClient.ensureQueryData(catalogQuery);
    const product = catalog.products.find((p) => p.id === params.productId);
    if (!product) throw notFound();
    return { name: product.name, description: product.description };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Hearth & Clay` : "Product unavailable — Hearth & Clay";
    const description = loaderData?.description || "Handcrafted homeware from Hearth & Clay.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Button asChild className="mt-6"><Link to="/">Back to store</Link></Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQuery);
  const product = data.products.find((p) => p.id === productId)!;
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const [variantId, setVariantId] = useState(product.variants[0]!.id);
  const [qty, setQty] = useState(1);
  const variant = (product.variants.find((v) => v.id === variantId) ?? product.variants[0])!;
  const max = Math.min(MAX_QTY, variant.available);

  const addToCart = () => {
    add({
      variantId: variant.id, productName: product.name, variantName: variant.name,
      price: variant.price, currency: product.currency, image: product.image,
      maxQuantity: variant.available, demo: product.demo,
    }, qty);
    toast.success(`${product.name} added to basket`, { action: { label: "View basket", onClick: () => setOpen(true) } });
  };

  const off = variant.compareAtPrice && variant.compareAtPrice > variant.price
    ? Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100) : null;
  const buyNow = () => { addToCart(); navigate({ to: "/checkout" }); };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-2 py-3 sm:px-3">
        <div className="grid gap-6 bg-card p-4 md:grid-cols-[2fr_3fr] md:p-6">
          <div className="md:sticky md:top-20 md:h-fit">
            <div className="overflow-hidden border">
              <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button size="lg" className="h-12 gap-2 rounded-sm bg-highlight font-semibold text-highlight-foreground hover:bg-highlight/90"
                disabled={variant.available <= 0} onClick={addToCart}>
                <ShoppingCart className="h-4 w-4" /> ADD TO BASKET
              </Button>
              <Button size="lg" className="h-12 gap-2 rounded-sm font-semibold" disabled={variant.available <= 0} onClick={buyNow}>
                <Zap className="h-4 w-4" /> BUY NOW
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link> <ChevronRight className="h-3 w-3" /> <span className="line-clamp-1">{product.name}</span>
            </nav>
            <div>
              <h1 className="text-xl font-medium md:text-2xl">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-0.5 rounded-sm bg-success px-1.5 py-0.5 text-xs font-semibold text-success-foreground">4.4 <Star className="h-3 w-3 fill-current" /></span>
                <span className="text-muted-foreground">24 ratings</span>
              </div>
              {off && <p className="mt-3 text-sm font-semibold text-success">Special price</p>}
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-3xl font-semibold">{formatPrice(variant.price, product.currency)}</span>
                {off && <>
                  <span className="text-muted-foreground line-through">{formatPrice(variant.compareAtPrice!, product.currency)}</span>
                  <span className="font-semibold text-success">{off}% off</span>
                </>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Final price confirmed by server at checkout.</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Available offers</p>
              <p className="flex gap-2"><Tag className="h-4 w-4 shrink-0 text-success" /> Free delivery on orders over ₹2,999</p>
              <p className="flex gap-2"><Tag className="h-4 w-4 shrink-0 text-success" /> 7-day easy returns on every handmade piece</p>
            </div>
            {product.variants.length > 1 && (
              <div className="flex items-start gap-6 text-sm">
                <p className="w-20 shrink-0 pt-1.5 text-muted-foreground">Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button key={v.id} onClick={() => { setVariantId(v.id); setQty(1); }}
                      className={`rounded-sm border-2 px-3 py-1.5 ${v.id === variant.id ? "border-primary font-semibold text-primary" : "border-border"}`}>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-6 text-sm">
              <p className="w-20 shrink-0 text-muted-foreground">Quantity</p>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-10 border py-1 text-center tabular-nums">{qty}</span>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" aria-label="Increase quantity" disabled={qty >= max} onClick={() => setQty(qty + 1)}><Plus className="h-3 w-3" /></Button>
              </div>
              <span className={`text-sm font-medium ${variant.available <= 5 ? "text-destructive" : "text-success"}`}>
                {variant.available > 0 ? (variant.available <= 5 ? `Hurry, only ${variant.available} left!` : "In stock") : "Sold out"}
              </span>
            </div>
            <div className="flex items-start gap-6 text-sm">
              <p className="w-20 shrink-0 text-muted-foreground">Description</p>
              <p className="leading-relaxed">{product.description}</p>
            </div>
            {product.demo && <p className="text-xs text-muted-foreground">Sample item — not for sale.</p>}
            <ul className="grid grid-cols-3 gap-3 border-t pt-5 text-center text-xs">
              <li className="flex flex-col items-center gap-1"><Truck className="h-5 w-5 text-primary" /> Free delivery over ₹2,999</li>
              <li className="flex flex-col items-center gap-1"><ShieldCheck className="h-5 w-5 text-primary" /> Server-verified checkout</li>
              <li className="flex flex-col items-center gap-1"><RotateCcw className="h-5 w-5 text-primary" /> 7-day returns</li>
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
      <CartSheet />
    </div>
  );
}
