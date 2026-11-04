import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/catalog";
import { adminHead, LOW_STOCK, one } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  head: () => adminHead("Products"),
  component: ProductsPage,
});

function ProductsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("id,name,slug,is_published,currency,images,category_id,categories(name),product_variants(id,price,inventory(quantity_on_hand,quantity_reserved))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const cats = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => { const { data, error } = await supabase.from("categories").select("*").order("sort_order"); if (error) throw error; return data; },
  });
  const publish = useMutation({
    mutationFn: async ({ id, v }: { id: string; v: boolean }) => {
      const { error } = await supabase.from("products").update({ is_published: v }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["catalog"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((p) => (cat === "all" || p.category_id === cat) && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Button asChild><Link to="/admin/products/$productId" params={{ productId: "new" }}><Plus className="mr-1 h-4 w-4" />Add product</Link></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="pl-8" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border bg-background px-2 text-sm" aria-label="Filter by category">
          <option value="all">All categories</option>
          {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {isLoading ? <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" /> : (
        <div className="overflow-x-auto rounded-lg bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Live</th></tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const prices = p.product_variants.map((v) => Number(v.price));
                const stock = p.product_variants.reduce((s, v) => { const i = one(v.inventory); return s + (i?.quantity_on_hand ?? 0) - (i?.quantity_reserved ?? 0); }, 0);
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <Link to="/admin/products/$productId" params={{ productId: p.id }} className="flex items-center gap-3 font-medium hover:text-primary">
                        {p.images[0] ? <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted" />}
                        <span>{p.name}<span className="block text-xs font-normal text-muted-foreground">{p.product_variants.length} option(s)</span></span>
                      </Link>
                    </td>
                    <td className="p-3">{one(p.categories)?.name ?? "—"}</td>
                    <td className="p-3">{prices.length ? formatPrice(Math.min(...prices), p.currency) : "—"}{prices.length > 1 && Math.max(...prices) !== Math.min(...prices) ? ` – ${formatPrice(Math.max(...prices), p.currency)}` : ""}</td>
                    <td className={`p-3 ${stock <= LOW_STOCK ? "font-semibold text-destructive" : ""}`}>{stock <= 0 ? "Sold out" : stock}</td>
                    <td className="p-3"><Switch checked={p.is_published} onCheckedChange={(v) => publish.mutate({ id: p.id, v })} aria-label={`Show ${p.name} in store`} /></td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
