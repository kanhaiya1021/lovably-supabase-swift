import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog";
import { adminHead } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  head: () => adminHead("Coupons"),
  component: CouponsPage,
});

const blank = { code: "", discount_type: "percent" as "percent" | "fixed", discount_value: "", max_discount: "", min_order_amount: "0", max_uses: "", expires_at: "" };

function CouponsPage() {
  const qc = useQueryClient();
  const [f, setF] = useState(blank);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => { const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  const add = useMutation({
    mutationFn: async () => {
      const code = f.code.trim().toUpperCase();
      const val = Number(f.discount_value);
      if (!/^[A-Z0-9_-]{3,30}$/.test(code)) throw new Error("Code: 3–30 letters/numbers");
      if (!(val > 0)) throw new Error("Discount must be more than 0");
      if (f.discount_type === "percent" && val > 90) throw new Error("Percent discount can be at most 90%");
      const { error } = await supabase.from("coupons").insert({
        code, discount_type: f.discount_type, discount_value: val,
        max_discount: f.max_discount ? Number(f.max_discount) : null,
        min_order_amount: Number(f.min_order_amount) || 0,
        max_uses: f.max_uses ? Number(f.max_uses) : null,
        expires_at: f.expires_at ? new Date(`${f.expires_at}T23:59:59`).toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => { setF(blank); toast.success("Coupon created"); refresh(); },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "This code already exists" : e.message),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, v }: { id: string; v: boolean }) => { const { error } = await supabase.from("coupons").update({ is_active: v }).eq("id", id); if (error) throw error; },
    onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw new Error("This coupon was used on orders — turn it off instead.");
    },
    onSuccess: () => { toast.success("Deleted"); refresh(); }, onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Coupons</h1>
      <form className="grid grid-cols-2 gap-3 rounded-lg bg-card p-4 text-sm shadow-sm sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
        <div><Label>Code</Label><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="DIWALI20" /></div>
        <div><Label>Type</Label>
          <select value={f.discount_type} onChange={(e) => setF({ ...f, discount_type: e.target.value as "percent" | "fixed" })} className="mt-0.5 w-full rounded-md border bg-background px-2 py-2">
            <option value="percent">% off</option><option value="fixed">₹ off</option>
          </select>
        </div>
        <div><Label>{f.discount_type === "percent" ? "Percent" : "Amount ₹"}</Label><Input inputMode="decimal" value={f.discount_value} onChange={(e) => setF({ ...f, discount_value: e.target.value })} /></div>
        <div><Label>Max discount ₹</Label><Input inputMode="decimal" value={f.max_discount} onChange={(e) => setF({ ...f, max_discount: e.target.value })} placeholder="optional" /></div>
        <div><Label>Min order ₹</Label><Input inputMode="decimal" value={f.min_order_amount} onChange={(e) => setF({ ...f, min_order_amount: e.target.value })} /></div>
        <div><Label>Max uses</Label><Input inputMode="numeric" value={f.max_uses} onChange={(e) => setF({ ...f, max_uses: e.target.value })} placeholder="unlimited" /></div>
        <div><Label>Expires on</Label><Input type="date" value={f.expires_at} onChange={(e) => setF({ ...f, expires_at: e.target.value })} /></div>
        <div className="flex items-end"><Button type="submit" className="w-full" disabled={add.isPending}><Plus className="mr-1 h-4 w-4" />Create</Button></div>
      </form>
      <p className="text-xs text-muted-foreground">Note: customers can't apply coupons at checkout yet — that step must be added to the secure order function.</p>
      {isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : (
        <div className="overflow-x-auto rounded-lg bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Min order</th><th className="p-3">Used</th><th className="p-3">Expires</th><th className="p-3">Active</th><th /></tr></thead>
            <tbody>
              {data?.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date();
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-3 font-mono font-semibold">{c.code}</td>
                    <td className="p-3">{c.discount_type === "percent" ? `${c.discount_value}%` : formatPrice(Number(c.discount_value), "INR")}{c.max_discount != null && <span className="text-xs text-muted-foreground"> (max {formatPrice(Number(c.max_discount), "INR")})</span>}</td>
                    <td className="p-3">{formatPrice(Number(c.min_order_amount), "INR")}</td>
                    <td className="p-3">{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ""}</td>
                    <td className="p-3">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-IN") : "Never"} {expired && <Badge variant="destructive">Expired</Badge>}</td>
                    <td className="p-3"><Switch checked={c.is_active} onCheckedChange={(v) => toggle.mutate({ id: c.id, v })} aria-label={`Activate ${c.code}`} /></td>
                    <td className="p-3"><Button size="sm" variant="ghost" onClick={() => confirm(`Delete ${c.code}?`) && del.mutate(c.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                );
              })}
              {!data?.length && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No coupons yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
