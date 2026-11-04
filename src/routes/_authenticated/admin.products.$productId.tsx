import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminHead, one, slugify } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/products/$productId")({
  head: () => adminHead("Edit product"),
  component: ProductEditor,
});

type VariantForm = { id?: string; name: string; sku: string; price: string; compare_at_price: string; is_active: boolean; stock: string; reserved: number };
type Form = { name: string; slug: string; description: string; category_id: string; images: string[]; is_published: boolean; variants: VariantForm[] };

const emptyVariant = (): VariantForm => ({ name: "Default", sku: "", price: "", compare_at_price: "", is_active: true, stock: "0", reserved: 0 });

function ProductEditor() {
  const { productId } = Route.useParams();
  const isNew = productId === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(isNew ? { name: "", slug: "", description: "", category_id: "", images: [], is_published: false, variants: [emptyVariant()] } : null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [imgUrl, setImgUrl] = useState("");

  const cats = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => { const { data, error } = await supabase.from("categories").select("*").order("sort_order"); if (error) throw error; return data; },
  });
  const product = useQuery({
    queryKey: ["admin-product", productId],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("*, product_variants(*, inventory(quantity_on_hand,quantity_reserved))").eq("id", productId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    const p = product.data;
    if (!p) return;
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? "", category_id: p.category_id ?? "", images: p.images, is_published: p.is_published,
      variants: p.product_variants.sort((a, b) => a.created_at.localeCompare(b.created_at)).map((v) => {
        const i = one(v.inventory);
        return { id: v.id, name: v.name, sku: v.sku, price: String(v.price), compare_at_price: v.compare_at_price != null ? String(v.compare_at_price) : "", is_active: v.is_active, stock: String(i?.quantity_on_hand ?? 0), reserved: i?.quantity_reserved ?? 0 };
      }),
    });
  }, [product.data]);

  const refresh = () => ["admin-products", "catalog", "admin-low-stock"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const save = useMutation({
    mutationFn: async (f: Form) => {
      if (!f.name.trim()) throw new Error("Name is required");
      const slug = slugify(f.slug || f.name);
      if (!slug) throw new Error("Slug is required");
      if (!f.variants.length) throw new Error("Add at least one option");
      for (const v of f.variants) {
        if (!v.sku.trim()) throw new Error("Every option needs a SKU");
        if (!(Number(v.price) > 0)) throw new Error(`Price for "${v.name}" must be more than 0`);
        if (v.compare_at_price && Number(v.compare_at_price) <= Number(v.price)) throw new Error(`MRP for "${v.name}" must be higher than price`);
        const st = Number(v.stock);
        if (!Number.isInteger(st) || st < v.reserved) throw new Error(`Stock for "${v.name}" must be a whole number, at least ${v.reserved} (reserved)`);
      }
      const payload = { name: f.name.trim(), slug, description: f.description || null, category_id: f.category_id || null, images: f.images, is_published: f.is_published };
      let id = productId;
      if (isNew) {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        id = data.id;
      } else {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
      }
      for (const vid of removed) {
        const { error } = await supabase.from("product_variants").delete().eq("id", vid);
        if (error) { // already ordered — hide instead
          await supabase.from("product_variants").update({ is_active: false }).eq("id", vid);
        }
      }
      for (const v of f.variants) {
        const row = { product_id: id, name: v.name || "Default", sku: v.sku.trim(), price: Number(v.price), compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null, is_active: v.is_active };
        let vid = v.id;
        if (vid) {
          const { error } = await supabase.from("product_variants").update(row).eq("id", vid);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("product_variants").insert(row).select("id").single();
          if (error) throw error;
          vid = data.id;
        }
        const { error: ie } = await supabase.from("inventory").upsert({ variant_id: vid, quantity_on_hand: Number(v.stock) });
        if (ie) throw ie;
      }
      return id;
    },
    onSuccess: (id) => {
      toast.success("Product saved");
      refresh();
      setRemoved([]);
      qc.invalidateQueries({ queryKey: ["admin-product", id] });
      if (isNew) navigate({ to: "/admin/products/$productId", params: { productId: id } });
    },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "That slug or SKU is already used" : e.message),
  });

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw new Error("This product has orders or options linked, so it can't be deleted. Turn off 'Live' to hide it instead.");
    },
    onSuccess: () => { toast.success("Product deleted"); refresh(); navigate({ to: "/admin/products" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!form) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" />;
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch });
  const setV = (i: number, patch: Partial<VariantForm>) => set({ variants: form.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) });

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm"><Link to="/admin/products"><ArrowLeft className="mr-1 h-4 w-4" />Products</Link></Button>
        <h1 className="font-display text-2xl font-semibold">{isNew ? "Add product" : form.name}</h1>
        <div className="ml-auto flex gap-2">
          {!isNew && <Button type="button" variant="outline" onClick={() => confirm("Delete this product?") && del.mutate()} disabled={del.isPending}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>}
          <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="space-y-3 rounded-lg bg-card p-4 shadow-sm">
            <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(e) => set({ name: e.target.value, ...(isNew ? { slug: slugify(e.target.value) } : {}) })} /></div>
            <div><Label htmlFor="slug">Web address (slug)</Label><Input id="slug" value={form.slug} onChange={(e) => set({ slug: e.target.value })} /></div>
            <div><Label htmlFor="desc">Description</Label><Textarea id="desc" rows={5} value={form.description} onChange={(e) => set({ description: e.target.value })} /></div>
          </section>

          <section className="rounded-lg bg-card p-4 shadow-sm">
            <h2 className="mb-2 font-semibold">Photos</h2>
            <div className="flex flex-wrap gap-2">
              {form.images.map((src, i) => (
                <div key={src + i} className="relative">
                  <img src={src} alt="" className="h-20 w-20 rounded object-cover" />
                  {i === 0 && <span className="absolute bottom-0 left-0 rounded-tr bg-primary px-1 text-[10px] text-primary-foreground">Main</span>}
                  <button type="button" aria-label="Remove photo" onClick={() => set({ images: form.images.filter((_, j) => j !== i) })} className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="Paste photo link (https://…)" />
              <Button type="button" variant="outline" onClick={() => { if (/^https:\/\//.test(imgUrl)) { set({ images: [...form.images, imgUrl] }); setImgUrl(""); } else toast.error("Link must start with https://"); }}>Add</Button>
            </div>
          </section>

          <section className="rounded-lg bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">Options, price & stock</h2>
              <Button type="button" size="sm" variant="outline" onClick={() => set({ variants: [...form.variants, { ...emptyVariant(), name: "" }] })}><Plus className="mr-1 h-4 w-4" />Add option</Button>
            </div>
            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div key={v.id ?? `new-${i}`} className="grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-3 text-sm sm:grid-cols-6">
                  <div className="col-span-2"><Label>Option name</Label><Input value={v.name} onChange={(e) => setV(i, { name: e.target.value })} placeholder="e.g. 350 ml / Ochre" /></div>
                  <div><Label>SKU</Label><Input value={v.sku} onChange={(e) => setV(i, { sku: e.target.value })} /></div>
                  <div><Label>Price ₹</Label><Input inputMode="decimal" value={v.price} onChange={(e) => setV(i, { price: e.target.value })} /></div>
                  <div><Label>MRP ₹</Label><Input inputMode="decimal" value={v.compare_at_price} onChange={(e) => setV(i, { compare_at_price: e.target.value })} placeholder="optional" /></div>
                  <div><Label>Stock</Label><Input inputMode="numeric" value={v.stock} onChange={(e) => setV(i, { stock: e.target.value })} /></div>
                  <div className="col-span-2 flex items-center justify-between sm:col-span-6">
                    <label className="flex items-center gap-2"><Switch checked={v.is_active} onCheckedChange={(c) => setV(i, { is_active: c })} />Available to buy</label>
                    <span className="text-xs text-muted-foreground">Reserved for orders: {v.reserved}</span>
                    <Button type="button" variant="ghost" size="sm" disabled={form.variants.length === 1}
                      onClick={() => { if (v.id) setRemoved([...removed, v.id]); set({ variants: form.variants.filter((_, j) => j !== i) }); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="space-y-3 rounded-lg bg-card p-4 shadow-sm">
            <label className="flex items-center justify-between font-medium">Live in store<Switch checked={form.is_published} onCheckedChange={(c) => set({ is_published: c })} /></label>
            <div>
              <Label htmlFor="cat">Category</Label>
              <select id="cat" value={form.category_id} onChange={(e) => set({ category_id: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm">
                <option value="">No category</option>
                {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
