import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Compass,
  CreditCard,
  Heart,
  HelpCircle,
  Instagram,
  Layers,
  Lock,
  Mail,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  StarHalf,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { CartSheet } from "@/components/shop/CartSheet";
import { ProductCard } from "@/components/shop/ProductCard";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { catalogQuery, type CatalogProduct } from "@/lib/catalog";
import throwImg from "@/assets/p-throw.jpg";
import candleImg from "@/assets/p-candle.jpg";
import basketImg from "@/assets/p-basket.jpg";
import mugImg from "@/assets/p-mug.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hearth & Clay — Handmade goods for slow living" },
      {
        name: "description",
        content: "Shop handmade ceramics, textiles and home goods. Add to your basket in a tap.",
      },
      {
        property: "og:title",
        content: "Hearth & Clay — Handmade goods for slow living",
      },
      {
        property: "og:description",
        content: "Shop handmade ceramics, textiles and home goods.",
      },
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
  const [searchTerm, setSearchTerm] = useState("");
  const shown = data.products.filter(
    (p) =>
      (!cat || p.categoryId === cat) &&
      (!searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailInput = (e.target as HTMLFormElement).elements.namedItem("email") as HTMLInputElement;
    const email = emailInput.value;
    if (!email) return;
    // Simulate submission
    toast.success("Subscribed! Check your inbox for your 10% off code.");
    emailInput.value = "";
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteHeader />
      <CartSheet />

            {/* Modern Ambient Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/[0.03] via-background to-background pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary shadow-xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Handcrafted & Sustainable Collection 2026
              </div>

              <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.12]">
                Elevate Everyday Living with <span className="text-primary italic">Timeless Craft</span>
              </h1>

              <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg">
                Thoughtfully crafted ceramics, textiles, and acoustic home goods. Built with sustainable materials, fair wages, and express delivery across India.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-12 px-8 rounded-full font-medium shadow-md transition-transform hover:scale-[1.02]">
                  <a href="#catalog" className="flex items-center gap-2">
                    Explore Collection
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full font-medium">
                  <a href="#features">Our Philosophy</a>
                </Button>
              </div>

              {/* Trust Badges Bar */}
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border/50 pt-8 max-w-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Free Delivery</p>
                    <p className="text-[11px] text-muted-foreground">Orders over ₹2,999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Live Stock</p>
                    <p className="text-[11px] text-muted-foreground">Server verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Easy Returns</p>
                    <p className="text-[11px] text-muted-foreground">7 days policy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Bento Layout */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card */}
                <div className="overflow-hidden rounded-3xl border border-border/60 bg-card p-2 shadow-2xl transition-all duration-500 hover:shadow-primary/5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                    <img
                      src={throwImg}
                      alt="Handcrafted Throw"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                        Featured Piece
                      </span>
                      <h3 className="mt-2 font-display text-xl font-medium">Heirloom Linen Throw</h3>
                      <p className="text-xs text-white/80">Pure organic handspun flax</p>
                    </div>
                  </div>
                </div>

                {/* Floating Glassmorphic Badge 1 (Rating) */}
                <div className="absolute -left-6 top-8 hidden sm:flex items-center gap-3 rounded-2xl border border-border/50 bg-card/90 p-3 shadow-xl backdrop-blur-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">4.9 / 5.0 Rating</p>
                    <p className="text-[11px] text-muted-foreground">Over 1,200+ Happy Homes</p>
                  </div>
                </div>

                {/* Floating Glassmorphic Badge 2 (Handmade) */}
                <div className="absolute -bottom-5 -right-4 flex items-center gap-2.5 rounded-2xl border border-border/50 bg-card/90 px-4 py-3 shadow-xl backdrop-blur-md">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold">100% Artisan Handmade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      


      {/* Catalog & Filter Section */}
      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Curated Catalog</span>
            <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Explore our Collection</h2>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -mt-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ceramics, throws..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-full pl-10 bg-muted/40 text-sm focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-border/40 pb-4">
          <Button
            size="sm"
            variant={cat === null ? "default" : "ghost"}
            onClick={() => setCat(null)}
            className="rounded-full text-xs"
          >
            All Items ({data.products.length})
          </Button>
          {data.categories.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={cat === c.id ? "default" : "ghost"}
              onClick={() => setCat(c.id)}
              className="rounded-full text-xs"
            >
              {c.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mt-8">
          {shown.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center">
              <p className="text-base text-muted-foreground">No pieces match your search or filter.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => {
                  setCat(null);
                  setSearchTerm("");
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 1. VISUAL CATEGORIES SHOWCASE */}
      <section className="border-b border-border/40 bg-muted/20 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Browse By Space</span>
              <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Curated Collections</h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Hand-selected natural textures crafted to bring grounded calmness into your daily rituals.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { name: "Ceramics & Mugs", desc: "Hand-thrown stoneware", img: mugImg, filter: "Ceramics" },
              { name: "Organic Textiles", desc: "Handspun flax & wool", img: throwImg, filter: "Textiles" },
              { name: "Aromatherapy", desc: "Pure soy & beeswax", img: candleImg, filter: "Candles" },
              { name: "Artisan Baskets", desc: "Woven river grass", img: basketImg, filter: "Decor" },
            ].map((item, idx) => (
              <a
                key={idx}
                href="#catalog"
                onClick={() => {
                  const match = data.categories.find((c) => c.name.toLowerCase().includes(item.filter.toLowerCase()));
                  if (match) setCat(match.id);
                }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-display text-sm font-medium leading-tight">{item.name}</p>
                    <p className="text-[11px] text-white/80">{item.desc}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* 2. THE ARTISAN STORY & IMPACT BENTO */}
      <section id="features" className="scroll-mt-16 border-b border-border/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Rooted in Heritage
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Crafted Slowly. Made for Generations.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every curve, glaze, and thread carries the touch of authentic artisans across traditional Indian craft clusters.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-12">
            {/* Story Card Left (7 cols) */}
            <div className="flex flex-col justify-between rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-8 md:col-span-7">
              <div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Ethical Sourcing</span>
                <h3 className="mt-4 font-display text-2xl font-semibold">Fair Wages & Zero Carbon Middlemen</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Unlike mass production factories, we partner directly with independent potters and weavers in Khurja, Maheshwar, and Jaipur. We preserve ancestral craft lineages while funding safe workshop conditions.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border/50 pt-6">
                <div>
                  <p className="font-display text-2xl font-bold text-primary">50+</p>
                  <p className="text-xs text-muted-foreground">Master Artisans</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-primary">100%</p>
                  <p className="text-xs text-muted-foreground">Plastic-Free Pack</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-primary">₹0</p>
                  <p className="text-xs text-muted-foreground">Hidden Fees</p>
                </div>
              </div>
            </div>

            {/* Visual Quote Card Right (5 cols) */}
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 md:col-span-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-medium">"Imperfection is the signature of human hands."</h3>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Small variations in glaze density and hand-thrown curves mean no two pieces are identical. Your mug or throw is uniquely yours.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                <PackageCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-medium">Safe transit wooden crates & recycled paper honeycomb packaging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FREQUENTLY ASKED QUESTIONS */}
      <section className="border-b border-border/40 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Got Questions?</span>
            <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-muted-foreground">Everything you need to know about materials, delivery, and returns.</p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                q: "Are the ceramic mugs microwave and dishwasher safe?",
                a: "Yes! All our ceramics are fired at cone 10 (above 1200°C) with lead-free, food-safe glazes. They are safe for microwave, oven, and dishwasher use, though handwashing keeps the matte finish looking brand new.",
              },
              {
                q: "How does shipping and safe transit work for fragile items?",
                a: "We ship all ceramics in custom molded honeycomb paper and double-walled biodegradable boxes. In the rare case of transit damage, just send a photo to our support within 48 hours for an instant replacement.",
              },
              {
                q: "What is your return & exchange policy?",
                a: "We offer an easy 7-day return window on all unused items in original condition. Simply open your My Account page or message our support.",
              },
              {
                q: "Do you offer gifting packaging?",
                a: "Yes, you can mark any order as a gift during checkout. We include a handwritten artisan card with zero price tags on the package.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-border/60 bg-card p-5 transition-all open:border-primary/40 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                  <span className="text-base font-medium">{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground border-t border-border/30 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <h2 className="mb-12 font-display text-3xl text-center">What Our Customers Say</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-start gap-1 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <StarHalf className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground italic">"The quality of these ceramics is unmatched. Every piece tells a story."</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="font-semibold">Priya M.</div>
              <Badge variant="outline" className="text-xs ml-auto">Verified Buyer</Badge>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start gap-1 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground italic">"The textiles are soft, durable, and ethically sourced. I love my throw!"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="font-semibold">Arjun K.</div>
              <Badge variant="outline" className="text-xs ml-auto">Verified Buyer</Badge>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start gap-1 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
              <Star className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground italic">"Fast delivery and excellent packaging. Will shop again!"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="font-semibold">Riya S.</div>
              <Badge variant="outline" className="text-xs ml-auto">Verified Buyer</Badge>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Card className="bg-gradient-to-br from-card/40 via-card/40 to-card/40 border border-border rounded-2xl px-8 py-12">
          <h2 className="text-2xl font-medium md:text-3xl mb-6">Join the Club & Get 10% Off Your First Order</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input
              type="email"
              placeholder="you@example.com"
              className="max-w-sm"
            />
            <Button type="submit" className="w-full sm:w-auto">
              Subscribe
            </Button>
          </form>
          <p className="mt-6 text-xs text-muted-foreground">
            By subscribing you agree to our <a href="#" className="text-primary hover:text-primary">Privacy Policy</a>.
          </p>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}

function TrustChip({ icon: Icon, label }: { label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <span className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}