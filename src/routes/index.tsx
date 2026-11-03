import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, RotateCcw, BadgePercent, LayoutGrid } from "lucide-react";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { CartSheet } from "@/components/shop/CartSheet";
import { ProductCard, discountOf } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { catalogQuery, formatPrice, type CatalogProduct } from "@/lib/catalog";
import throwImg from "@/assets/p-throw.jpg";
import candleImg from "@/assets/p-candle.jpg";
import basketImg from "@/assets/p-basket.jpg";
import mugImg from "@/assets/p-mug.jpg";

type Sort = "relevance" | "low" | "high" | "discount";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({
    q: typeof s["q"] === "string" && s["q"] ? (s["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Hearth & Clay — Shop handmade homeware online" },
      { name: "description", content: "Big savings on handmade ceramics, throws, candles and baskets from Indian artisans. Free delivery over ₹2,999." },
      { property: "og:title", content: "Hearth & Clay — Shop handmade homeware online" },
      { property: "og:description", content: "Handmade ceramics, textiles and home goods from Indian artisans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Index,
});

const slides = [
  { img: throwImg, tag: "Winter Warmers", title: "Wool throws from ₹3,499", sub: "Handspun · Up to 15% off" },
  { img: mugImg, tag: "Kitchen Fest", title: "Stoneware starting ₹899", sub: "Hand-thrown in Khurja" },
  { img: candleImg, tag: "Festive Glow", title: "Candles for every room", sub: "50+ hours burn time" },
];

const catImages = [mugImg, throwImg, candleImg, basketImg];

function Index() {
  const { data } = useSuspenseQuery(catalogQuery);
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("relevance");
  const [inStock, setInStock] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const term = (q ?? "").toLowerCase();
  const price = (p: CatalogProduct) => p.variants[0]!.price;
  const disc = (p: CatalogProduct) => discountOf(p.variants[0]!.price, p.variants[0]!.compareAtPrice) ?? 0;
  const shown = data.products
    .filter((p) => (!cat || p.categoryId === cat)
      && (!inStock || p.variants[0]!.available > 0)
      && (!term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)))
    .sort((a, b) => sort === "low" ? price(a) - price(b) : sort === "high" ? price(b) - price(a) : sort === "discount" ? disc(b) - disc(a) : 0);

  const deals = [...data.products].sort((a, b) => disc(b) - disc(a)).slice(0, 6);
  const s = slides[slide]!;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader initialQuery={q} />
      <CartSheet />

      {/* Category strip */}
      <div className="bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-3 sm:justify-center sm:gap-10">
          <button onClick={() => setCat(null)} className="flex shrink-0 flex-col items-center gap-1.5">
            <span className={`flex h-16 w-16 items-center justify-center rounded-full bg-muted ${cat === null ? "ring-2 ring-primary" : ""}`}>
              <LayoutGrid className="h-7 w-7 text-primary" />
            </span>
            <span className={`text-xs font-semibold ${cat === null ? "text-primary" : ""}`}>All</span>
          </button>
          {data.categories.map((c, i) => (
            <button key={c.id} onClick={() => { setCat(c.id); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}
              className="flex shrink-0 flex-col items-center gap-1.5">
              <img src={catImages[i % catImages.length]} alt="" className={`h-16 w-16 rounded-full object-cover ${cat === c.id ? "ring-2 ring-primary" : ""}`} />
              <span className={`text-xs font-semibold ${cat === c.id ? "text-primary" : ""}`}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-3 px-2 py-3 sm:px-3">
        {/* Banner carousel */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="grid min-h-[220px] items-center md:grid-cols-2 md:min-h-[280px]">
            <div className="p-6 md:p-12">
              <span className="rounded-sm bg-highlight px-2 py-0.5 text-xs font-bold uppercase text-highlight-foreground">{s.tag}</span>
              <h1 className="mt-3 font-display text-3xl font-semibold md:text-5xl">{s.title}</h1>
              <p className="mt-2 text-sm opacity-90 md:text-base">{s.sub}</p>
              <a href="#catalog" className="mt-5 inline-block rounded-sm bg-card px-6 py-2.5 text-sm font-semibold text-primary shadow">Shop now</a>
            </div>
            <img src={s.img} alt="" className="hidden h-full max-h-[280px] w-full object-cover md:block" />
          </div>
          <button aria-label="Previous offer" onClick={() => setSlide((slide + slides.length - 1) % slides.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-md bg-card/90 px-2 py-6 text-foreground shadow"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Next offer" onClick={() => setSlide((slide + 1) % slides.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-md bg-card/90 px-2 py-6 text-foreground shadow"><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full bg-primary-foreground transition-all ${i === slide ? "w-5" : "w-1.5 opacity-50"}`} />
            ))}
          </div>
        </section>

        {/* Trust bar */}
        <section className="grid grid-cols-2 gap-px bg-border text-xs font-medium md:grid-cols-4">
          {[
            [Truck, "Free delivery over ₹2,999"], [ShieldCheck, "Server-verified prices"],
            [RotateCcw, "7-day easy returns"], [BadgePercent, "Fair wages to artisans"],
          ].map(([Icon, t]) => {
            const I = Icon as typeof Truck;
            return <div key={t as string} className="flex items-center justify-center gap-2 bg-card py-3"><I className="h-4 w-4 text-primary" />{t as string}</div>;
          })}
        </section>

        {/* Deals row */}
        <section className="bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Best deals on handmade</h2>
            <a href="#catalog" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="See all"><ChevronRight className="h-4 w-4" /></a>
          </div>
          <div className="flex gap-4 overflow-x-auto p-4">
            {deals.map((p) => {
              const d = disc(p);
              return (
                <Link key={p.id} to="/products/$productId" params={{ productId: p.id }}
                  className="flex w-40 shrink-0 flex-col items-center rounded-md border p-3 text-center hover:shadow-md">
                  <img src={p.image} alt={p.name} className="h-32 w-32 object-cover" loading="lazy" />
                  <p className="mt-2 line-clamp-1 text-sm font-medium">{p.name}</p>
                  <p className="text-sm font-semibold text-success">{d ? `Min. ${d}% off` : `From ${formatPrice(price(p), p.currency)}`}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Listing with filters */}
        <section id="catalog" className="flex scroll-mt-20 flex-col gap-3 md:flex-row">
          <aside className="h-fit bg-card md:sticky md:top-20 md:w-60 md:shrink-0">
            <p className="border-b px-4 py-3 text-lg font-semibold">Filters</p>
            <div className="border-b px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Categories</p>
              {[{ id: null as string | null, name: "All" }, ...data.categories].map((c) => (
                <label key={c.id ?? "all"} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                  <input type="radio" name="cat" checked={cat === c.id} onChange={() => setCat(c.id)} className="accent-primary" />
                  {c.name}
                </label>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-primary" />
              In stock only
            </label>
          </aside>

          <div className="min-w-0 flex-1 bg-card">
            <div className="border-b px-4 pt-3">
              {q && (
                <p className="text-sm">
                  Results for "<span className="font-semibold">{q}</span>"{" "}
                  <button className="text-primary underline" onClick={() => navigate({ to: "/", search: {} })}>clear</button>
                </p>
              )}
              <p className="text-xs text-muted-foreground">Showing {shown.length} of {data.products.length} products</p>
              <div className="flex gap-4 overflow-x-auto text-sm">
                <span className="py-2 font-semibold">Sort By</span>
                {([["relevance", "Relevance"], ["low", "Price — Low to High"], ["high", "Price — High to Low"], ["discount", "Discount"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setSort(k)}
                    className={`shrink-0 border-b-2 py-2 ${sort === k ? "border-primary font-semibold text-primary" : "border-transparent"}`}>{l}</button>
                ))}
              </div>
            </div>
            {data.isDemo && <p className="bg-highlight/20 px-4 py-2 text-xs">Sample items shown — not for sale.</p>}
            {shown.length === 0 ? (
              <div className="p-16 text-center text-sm text-muted-foreground">
                No products match.{" "}
                <button className="text-primary underline" onClick={() => { setCat(null); setInStock(false); navigate({ to: "/", search: {} }); }}>Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4">
                {shown.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
