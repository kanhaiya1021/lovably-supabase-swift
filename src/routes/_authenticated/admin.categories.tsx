import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminHead, slugify } from "@/lib/admin";
import type { Database } from "@/integrations/supabase/types";

type Cat = Database["public"]["Tables"]["categories"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => adminHead("Categories"),
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => { const { data, error } = await supabase.from("categories").select("*, products(count)").order("sort_order"); if (error) throw error; return data; },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-categories"] }); qc.invalidateQueries({ queryKey: ["catalog"] }); };
  const add = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Enter a name");
      const { error } = await supabase.from("categories").insert({ name: name.trim(), slug: slugify(name), sort_order: (data?.length ?? 0) + 1 });
      if (error) throw error;
    },
    onSuccess: () => { setName(""); toast.success("Category added"); refresh(); },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "A category with this name already exists" : e.message),
  });

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-semibold">Categories</h1>
      <form className="flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" />
        <Button type="submit" disabled={add.isPending}><Plus className="mr-1 h-4 w-4" />Add</Button>
      </form>
      {isLoading ? <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" /> : (
        <div className="space-y-2">
          {data?.map((c) => <CategoryRow key={c.id} c={c} count={(c.products as unknown as { count: number }[])?.[0]?.count ?? 0} onSaved={refresh} />)}
        </div>
      )}
    </div>
  );
}

function CategoryRow({ c, count, onSaved }: { c: Cat; count: number; onSaved: () => void }) {
  const [f, setF] = useState({ name: c.name, slug: c.slug, description: c.description ?? "", image_url: c.image_url ?? "", sort_order: String(c.sort_order) });
  const save = useMutation({
    mutationFn: async (patch: Partial<Cat>) => {
      const { error } = await supabase.from("categories").update(patch).eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async () => {
      if (count > 0) throw new Error(`Move its ${count} product(s) to another category first`);
      const { error } = await supabase.from("categories").delete().eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="grid gap-2 rounded-lg bg-card p-3 text-sm shadow-sm sm:grid-cols-12 sm:items-center">
      <Input className="sm:col-span-3" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Name" />
      <Input className="sm:col-span-2" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} aria-label="Slug" />
      <Input className="sm:col-span-3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Description" aria-label="Description" />
      <Input className="sm:col-span-1" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} inputMode="numeric" aria-label="Order" title="Display order" />
      <span className="text-xs text-muted-foreground sm:col-span-1">{count} items</span>
      <div className="flex items-center gap-2 sm:col-span-2 sm:justify-end">
        <Switch checked={c.is_active} onCheckedChange={(v) => save.mutate({ is_active: v })} aria-label="Visible" title="Visible in store" />
        <Button size="sm" onClick={() => save.mutate({ name: f.name, slug: slugify(f.slug), description: f.description || null, image_url: f.image_url || null, sort_order: Number(f.sort_order) || 0 })}>Save</Button>
        <Button size="sm" variant="ghost" onClick={() => confirm(`Delete ${c.name}?`) && del.mutate()} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
