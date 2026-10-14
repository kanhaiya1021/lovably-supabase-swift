import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { CartSheet } from "@/components/shop/CartSheet";
import { ProductCard } from "@/components/shop/ProductCard";
import { catalogQuery } from "@/lib/catalog";
import throwImg from "@/assets/p-throw.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hearth & Clay — Handmade goods for slow living" },
      { name: "description", content: "Shop handmade ceramics, textiles and home goods. Add to your basket in a tap." },
      { property: "og:title", content: "Hearth & Clay — Handmade goods for slow living" },
      { property: "og:description", content: "Shop handmade ceramics, textiles and home goods." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [cat, setCat] = useState<string | null>(null);
  const shown = cat ? data.products.filter((p) => p.categoryId === cat) : data.products;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader />
      <CartSheet />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Autumn collection</p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] md:text-6xl">
            Made slowly,<br />meant to <em className="text-primary">last.</em>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Ceramics, textiles and small comforts from independent makers.
          </p>
          <Button asChild size="lg" className="mt-8"><a href="#shop">Shop the collection</a></Button>
        </div>
        <img src={throwImg} alt="Folded wool throw" width={800} height={1008} className="aspect-[4/5] w-full rounded-lg object-cover md:max-h-[560px]" />
      </section>

      <section id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-24">
        {data.isDemo && (
          <p className="mb-6 rounded-md border border-dashed bg-secondary/60 p-3 text-sm text-muted-foreground">
            Showing sample products — add real products to your store and they'll appear here instead.
          </p>
        )}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl">Shop all</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={cat === null ? "default" : "outline"} onClick={() => setCat(null)}>All</Button>
            {data.categories.map((c) => (
              <Button key={c.id} size="sm" variant={cat === c.id ? "default" : "outline"} onClick={() => setCat(c.id)}>{c.name}</Button>
            ))}
          </div>
        </div>
        {shown.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">© Hearth &amp; Clay</footer>
    </div>
  );
}
