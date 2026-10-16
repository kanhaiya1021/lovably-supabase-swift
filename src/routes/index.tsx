import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  Instagram,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  StarHalf,
  Truck,
  X,
  Youtube,
  Linkedin,
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

      <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-32 overflow-hidden">
        <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-medium text-primary">Handcrafted & Curated</span>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Elevate Everyday Living with Timeless Craft
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed md:text-lg">
              Discover authentic design, sustainable materials, and fast pan-India delivery. Each piece is handcrafted to elevate your everyday experience.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="px-8 font-medium">
                <a href="#catalog">Explore Collection</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 font-medium">
                <a href="#features">Our Story</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl bg-card shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <img
                src={throwImg}
                alt="Handcrafted throw"
                className="w-full h-auto rounded-2xl object-cover aspect-[4/5] md:max-h-[560px]"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="px-3 py-1 font-medium">
                  Trending Collection
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-24">
        <h2 className="mb-8 font-display text-3xl">Shop all</h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={cat === null ? "default" : "outline"} onClick={() => setCat(null)}>
              All
            </Button>
            {data.categories.map((c) => (
              <Button key={c.id} size="sm" variant={cat === c.id ? "default" : "outline"} onClick={() => setCat(c.id)}>
                {c.name}
              </Button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -mt-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{shown.length} results</p>

        {shown.length === 0 ? (
          <Card className="py-20 text-center">
            <p className="text-muted-foreground">No products match your filters.</p>
            <Button variant="outline" className="mt-4 px-6 py-3" onClick={() => {
              setCat(null);
              setSearchTerm("");
            }}>
              Reset filters
            </Button>
          </Card>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <h2 className="mb-8 font-display text-3xl text-center">Crafted for Generations</h2>
        <p className="mb-6 text-lg text-muted-foreground">
          Handmade with care, supported by artisans, and built to last. Zero plastic packaging, fair wages, and timeless design.
        </p>
        <ul className="mt-6 space-y-3">
          <li className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            <span>Generational craftsmanship</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            <span>Artisan support</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            <span>Zero plastic packaging</span>
          </li>
        </ul>
        <Card className="relative overflow-hidden">
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="h-4 w-4">
              Trending Now
            </Badge>
          </div>
          <img
            src={candleImg}
            alt="Amber Glass Candle"
            className="w-full h-auto object-cover aspect-[4/5] md:max-h-[400px]"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-card/90 to-transparent">
            <p className="font-medium">Oatmeal Wool Throw</p>
            <Button size="sm" className="mt-2">
              Quick view
            </Button>
          </div>
        </Card>
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