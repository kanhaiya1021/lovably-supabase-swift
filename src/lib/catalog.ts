import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import mug from "@/assets/p-mug.jpg";
import throwImg from "@/assets/p-throw.jpg";
import candle from "@/assets/p-candle.jpg";
import basket from "@/assets/p-basket.jpg";

export type CatalogVariant = {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  available: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string | null;
  currency: string;
  variants: CatalogVariant[];
  /** Sample item shown while the real catalog is empty. Never synced or sold. */
  demo: boolean;
};

export type CatalogCategory = { id: string; name: string };

export type Catalog = { products: CatalogProduct[]; categories: CatalogCategory[]; isDemo: boolean };

const demoCategories: CatalogCategory[] = [
  { id: "demo-kitchen", name: "Kitchen" },
  { id: "demo-living", name: "Living" },
];

const demoProducts: CatalogProduct[] = [
  {
    id: "demo-mug", name: "Terracotta Mug", description: "Hand-thrown stoneware, unglazed outside, smooth inside.",
    image: mug, categoryId: "demo-kitchen", currency: "INR", demo: true,
    variants: [{ id: "demo-mug-v", name: "350 ml", price: 899, compareAtPrice: null, available: 24 }],
  },
  {
    id: "demo-throw", name: "Oatmeal Wool Throw", description: "Soft brushed wool with hand-knotted fringe.",
    image: throwImg, categoryId: "demo-living", currency: "INR", demo: true,
    variants: [{ id: "demo-throw-v", name: "130 × 170 cm", price: 4499, compareAtPrice: 5299, available: 4 }],
  },
  {
    id: "demo-candle", name: "Amber Glass Candle", description: "Sandalwood & amber, about 50 hours of burn time.",
    image: candle, categoryId: "demo-living", currency: "INR", demo: true,
    variants: [{ id: "demo-candle-v", name: "255 g", price: 1299, compareAtPrice: null, available: 18 }],
  },
  {
    id: "demo-basket", name: "Woven Rattan Basket", description: "Natural rattan with sturdy loop handles.",
    image: basket, categoryId: "demo-living", currency: "INR", demo: true,
    variants: [{ id: "demo-basket-v", name: "Medium", price: 2199, compareAtPrice: null, available: 0 }],
  },
];

async function fetchCatalog(): Promise<Catalog> {
  const [{ data: cats }, { data: prods, error }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order"),
    supabase
      .from("products")
      .select("id,name,description,images,category_id,currency,product_variants(id,name,price,compare_at_price,is_active,inventory(quantity_on_hand,quantity_reserved))")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
  ]);

  const products: CatalogProduct[] = (error ? [] : prods ?? [])
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      image: p.images?.[0] ?? mug,
      categoryId: p.category_id,
      currency: p.currency,
      demo: false,
      variants: (p.product_variants ?? [])
        .filter((v) => v.is_active)
        .map((v) => {
          const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
          return {
            id: v.id, name: v.name, price: Number(v.price),
            compareAtPrice: v.compare_at_price == null ? null : Number(v.compare_at_price),
            available: inv ? Math.max(0, inv.quantity_on_hand - inv.quantity_reserved) : 0,
          };
        }),
    }))
    .filter((p) => p.variants.length > 0);

  if (products.length === 0) return { products: demoProducts, categories: demoCategories, isDemo: true };
  return { products, categories: cats ?? [], isDemo: false };
}

export const catalogQuery = queryOptions({ queryKey: ["catalog"], queryFn: fetchCatalog, staleTime: 60_000 });

export function formatPrice(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
