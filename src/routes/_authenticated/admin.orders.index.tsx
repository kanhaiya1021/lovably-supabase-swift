import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog";
import { adminHead, ORDER_STATUSES, statusLabel, type OrderStatus } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  head: () => adminHead("Orders"),
  component: OrdersPage,
});

function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders")
        .select("id,order_number,status,grand_total,currency,created_at,shipping_address,order_items(quantity)")
        .order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const rows = (data ?? []).filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (!q) return true;
    const a = o.shipping_address as { full_name?: string; city?: string; phone?: string };
    return `${o.order_number} ${a?.full_name ?? ""} ${a?.city ?? ""} ${a?.phone ?? ""}`.toLowerCase().includes(q.toLowerCase());
  });

  const exportCsv = () => {
    const lines = [["Order", "Date", "Customer", "City", "Items", "Total", "Status"].join(",")];
    rows.forEach((o) => {
      const a = o.shipping_address as { full_name?: string; city?: string };
      lines.push([o.order_number, new Date(o.created_at).toISOString().slice(0, 10), `"${a?.full_name ?? ""}"`, `"${a?.city ?? ""}"`,
        o.order_items.reduce((s, i) => s + i.quantity, 0), o.grand_total, o.status].join(","));
    });
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const el = document.createElement("a"); el.href = url; el.download = "orders.csv"; el.click(); URL.revokeObjectURL(url);
  };

  const count = (s: OrderStatus) => (data ?? []).filter((o) => o.status === s).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold">Orders</h1>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows.length}><Download className="mr-1 h-4 w-4" />Export CSV</Button>
      </div>
      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant={status === "all" ? "default" : "outline"} onClick={() => setStatus("all")}>All ({data?.length ?? 0})</Button>
        {ORDER_STATUSES.map((s) => (
          <Button key={s} size="sm" className="capitalize" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)}>{statusLabel(s)} ({count(s)})</Button>
        ))}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, name, city, phone" className="pl-8" />
      </div>
      {isLoading ? <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" /> : !rows.length ? (
        <p className="rounded-lg bg-card p-6 text-center text-muted-foreground">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const a = o.shipping_address as { full_name?: string; city?: string };
                return (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 font-medium"><Link to="/admin/orders/$orderId" params={{ orderId: o.id }} className="text-primary hover:underline">#{o.order_number}</Link></td>
                    <td className="p-3">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="p-3">{a?.full_name ?? "—"}<span className="block text-xs text-muted-foreground">{a?.city}</span></td>
                    <td className="p-3">{o.order_items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="p-3">{formatPrice(Number(o.grand_total), o.currency)}</td>
                    <td className="p-3"><Badge variant="secondary" className="capitalize">{statusLabel(o.status)}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
