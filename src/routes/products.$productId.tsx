import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, ShoppingBag, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shop/SiteHeader";
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
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const max = Math.min(MAX_QTY, variant.available);

  const addToCart = () => {
    add({
      variantId: variant.id, productName: product.name, variantName: variant.name,
      price: variant.price, currency: product.currency, image: product.image,
      maxQuantity: variant.available, demo: product.demo,
    }, qty);
    toast.success(`${product.name} added to basket`, { action: { label: "View basket", onClick: () => setOpen(true) } });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-muted">
            <img src={product.image} alt={product.name} className="aspect-[4/5] h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight">{product.name}</h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-semibold">{formatPrice(variant.price, product.currency)}</span>
                {variant.compareAtPrice && (
                  <span className="text-muted-foreground line-through">{formatPrice(variant.compareAtPrice, product.currency)}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Final price confirmed by server at checkout.</p>
            </div>
            <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            {product.variants.length > 1 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Button key={v.id} size="sm" className="rounded-full" variant={v.id === variant.id ? "default" : "outline"}
                      onClick={() => { setVariantId(v.id); setQty(1); }}>
                      {v.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm font-medium">
              {variant.available > 0 ? (variant.available <= 5 ? `Only ${variant.available} left` : "In stock") : "Sold out"}
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border">
                <Button size="icon" variant="ghost" className="rounded-full" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center tabular-nums">{qty}</span>
                <Button size="icon" variant="ghost" className="rounded-full" aria-label="Increase quantity" disabled={qty >= max} onClick={() => setQty(qty + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" className="flex-1 gap-2 rounded-full" disabled={variant.available <= 0} onClick={addToCart}>
                <ShoppingBag className="h-4 w-4" /> {variant.available <= 0 ? "Sold out" : "Add to basket"}
              </Button>
            </div>
            {product.demo && <p className="text-xs text-muted-foreground">Sample item — not for sale.</p>}
            <ul className="grid gap-3 border-t pt-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free delivery over ₹2,999</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure, server-verified checkout</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Easy returns</li>
            </ul>
          </div>
        </div>
      </main>
      <CartSheet />
    </div>
  );
}
