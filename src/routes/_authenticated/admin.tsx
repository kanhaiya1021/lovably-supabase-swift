import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert, Package, Boxes } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { formatPrice } from "@/lib/catalog";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
const STATUSES: OrderStatus[] = ["pending", "awaiting_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Hearth & Clay" },
      { name: "description", content: "Manage orders, products, prices and stock for Hearth & Clay." },
      { property: "og:title", content: "Admin Panel — Hearth & Clay" },
      { property: "og:description", content: "Store management for Hearth & Clay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
  });

  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        {isLoading ? (
          <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-primary" />
        ) : !isAdmin ? (
          <div className="mx-auto mt-16 max-w-md rounded-lg bg-card p-8 text-center shadow-sm">
            <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-3 text-xl font-semibold">Admins only</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your account doesn't have admin access.</p>
            <Button asChild className="mt-4"><Link to="/">Back to store</Link></Button>
          </div>
        ) : (
          <>
            <h1 className="mb-4 font-display text-2xl font-semibold">Admin Panel</h1>
            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders"><Package className="mr-1.5 h-4 w-4" />Orders</TabsTrigger>
                <TabsTrigger value="products"><Boxes className="mr-1.5 h-4 w-4" />Products & Stock</TabsTrigger>
              </TabsList>
              <TabsContent value="orders"><OrdersTab /></TabsContent>
              <TabsContent value="products"><ProductsTab /></TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

function OrdersTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,status,grand_total,currency,created_at,shipping_address,order_items(quantity)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Order updated"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" />;
  if (!data?.length) return <p className="mt-6 rounded-lg bg-card p-6 text-center text-muted-foreground">No orders yet.</p>;

  return (
    <div className="mt-3 overflow-x-auto rounded-lg bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b text-left text-muted-foreground">
          <tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {data.map((o) => {
            const addr = o.shipping_address as { full_name?: string; city?: string } | null;
            return (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-3 font-medium">#{o.order_number}</td>
                <td className="p-3">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                <td className="p-3">{addr?.full_name ?? "—"}<span className="block text-xs text-muted-foreground">{addr?.city}</span></td>
                <td className="p-3">{o.order_items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="p-3">{formatPrice(Number(o.grand_total), o.currency)}</td>
                <td className="p-3">
                  <select
                    value={o.status}
                    disabled={update.isPending}
                    onChange={(e) => update.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                    className="rounded-md border bg-background px-2 py-1 text-sm"
                    aria-label={`Status for order ${o.order_number}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,is_published,currency,images,product_variants(id,name,sku,price,inventory(quantity_on_hand,quantity_reserved))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" />;
  return (
    <div className="mt-3 space-y-3">
      {data?.map((p) => <ProductRow key={p.id} p={p} />)}
    </div>
  );
}

type AdminProduct = {
  id: string; name: string; is_published: boolean; currency: string; images: string[];
  product_variants: { id: string; name: string; sku: string; price: number; inventory: { quantity_on_hand: number; quantity_reserved: number } | { quantity_on_hand: number; quantity_reserved: number }[] | null }[];
};

function ProductRow({ p }: { p: AdminProduct }) {
  const qc = useQueryClient();
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["catalog"] }); };
  const publish = useMutation({
    mutationFn: async (v: boolean) => {
      const { error } = await supabase.from("products").update({ is_published: v }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="rounded-lg bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {p.images[0] && <img src={p.images[0]} alt="" className="h-12 w-12 rounded object-cover" />}
        <div className="flex-1 font-medium">{p.name}</div>
        <Badge variant={p.is_published ? "default" : "secondary"}>{p.is_published ? "Live" : "Hidden"}</Badge>
        <Switch checked={p.is_published} onCheckedChange={(v) => publish.mutate(v)} aria-label={`Show ${p.name} in store`} />
      </div>
      <div className="mt-3 space-y-2">
        {p.product_variants.map((v) => <VariantRow key={v.id} v={v} currency={p.currency} onSaved={refresh} />)}
      </div>
    </div>
  );
}

function VariantRow({ v, currency, onSaved }: { v: AdminProduct["product_variants"][number]; currency: string; onSaved: () => void }) {
  const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
  const [price, setPrice] = useState(String(v.price));
  const [stock, setStock] = useState(String(inv?.quantity_on_hand ?? 0));
  const save = useMutation({
    mutationFn: async () => {
      const pr = Number(price), st = Number(stock);
      if (!(pr > 0)) throw new Error("Price must be more than 0");
      if (!Number.isInteger(st) || st < (inv?.quantity_reserved ?? 0)) throw new Error(`Stock must be a whole number, at least ${inv?.quantity_reserved ?? 0} (reserved)`);
      const { error: e1 } = await supabase.from("product_variants").update({ price: pr }).eq("id", v.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("inventory").upsert({ variant_id: v.id, quantity_on_hand: st });
      if (e2) throw e2;
    },
    onSuccess: () => { toast.success("Price & stock saved"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted/50 p-2 text-sm">
      <span className="min-w-32 flex-1">{v.name} <span className="text-xs text-muted-foreground">· {v.sku}</span></span>
      <label className="flex items-center gap-1">₹<Input value={price} onChange={(e) => setPrice(e.target.value)} className="h-8 w-24" inputMode="decimal" aria-label="Price" /></label>
      <label className="flex items-center gap-1">Stock<Input value={stock} onChange={(e) => setStock(e.target.value)} className="h-8 w-20" inputMode="numeric" aria-label="Stock" /></label>
      <span className="text-xs text-muted-foreground">Reserved {inv?.quantity_reserved ?? 0} · now {formatPrice(Number(v.price), currency)}</span>
      <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
    </div>
  );
}
