import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, IndianRupee, Package, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog";
import { adminHead, LOW_STOCK, one, REVENUE_STATUSES, statusLabel } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => adminHead("Dashboard"),
  component: Dashboard,
});

function Dashboard() {
  const orders = useQuery({
    queryKey: ["admin-dash-orders"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data, error } = await supabase.from("orders")
        .select("id,order_number,status,grand_total,currency,created_at,shipping_address")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
  });
  const lowStock = useQuery({
    queryKey: ["admin-low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_variants")
        .select("id,name,sku,product_id,products(name),inventory(quantity_on_hand,quantity_reserved)");
      if (error) throw error;
      return data
        .map((v) => { const i = one(v.inventory); return { ...v, available: (i?.quantity_on_hand ?? 0) - (i?.quantity_reserved ?? 0) }; })
        .filter((v) => v.available <= LOW_STOCK)
        .sort((a, b) => a.available - b.available);
    },
  });

  if (orders.isLoading) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" />;
  const list = orders.data ?? [];
  const today = new Date().toDateString();
  const revenue = (rows: typeof list) => rows.filter((o) => REVENUE_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.grand_total), 0);
  const todays = list.filter((o) => new Date(o.created_at).toDateString() === today);
  const pending = list.filter((o) => ["pending", "awaiting_payment", "paid", "processing"].includes(o.status));

  // last 14 days revenue bars
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 864e5);
    const key = d.toDateString();
    return { label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), value: revenue(list.filter((o) => new Date(o.created_at).toDateString() === key)) };
  });
  const max = Math.max(1, ...days.map((d) => d.value));

  const cards = [
    { label: "Today's sales", value: formatPrice(revenue(todays), "INR"), icon: IndianRupee },
    { label: "Sales (30 days)", value: formatPrice(revenue(list), "INR"), icon: IndianRupee },
    { label: "Orders (30 days)", value: String(list.length), icon: Package },
    { label: "To fulfil", value: String(pending.length), icon: Clock },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-card p-4 shadow-sm">
            <c.icon className="h-4 w-4 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">{c.label}</p>
            <p className="text-xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Sales — last 14 days</h2>
        <div className="flex h-40 items-end gap-1">
          {days.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${formatPrice(d.value, "INR")}`}>
              <div className="w-full rounded-t bg-primary/80" style={{ height: `${(d.value / max) * 100}%`, minHeight: 2 }} />
              <span className="hidden text-[10px] text-muted-foreground sm:block">{d.label.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Recent orders</h2><Link to="/admin/orders" className="text-sm text-primary">View all</Link></div>
          {list.length === 0 ? <p className="text-sm text-muted-foreground">No orders in the last 30 days.</p> : (
            <ul className="divide-y text-sm">
              {list.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link to="/admin/orders/$orderId" params={{ orderId: o.id }} className="flex items-center justify-between py-2 hover:text-primary">
                    <span>#{o.order_number} · {(o.shipping_address as { full_name?: string })?.full_name ?? "—"}</span>
                    <span className="flex items-center gap-2"><Badge variant="secondary" className="capitalize">{statusLabel(o.status)}</Badge>{formatPrice(Number(o.grand_total), o.currency)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg bg-card p-4 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-destructive" />Low stock (≤ {LOW_STOCK})</h2>
          {!lowStock.data?.length ? <p className="text-sm text-muted-foreground">All products have enough stock.</p> : (
            <ul className="divide-y text-sm">
              {lowStock.data.slice(0, 8).map((v) => (
                <li key={v.id}>
                  <Link to="/admin/products/$productId" params={{ productId: v.product_id }} className="flex justify-between py-2 hover:text-primary">
                    <span>{one(v.products)?.name} <span className="text-muted-foreground">· {v.name}</span></span>
                    <span className={v.available <= 0 ? "font-semibold text-destructive" : ""}>{v.available <= 0 ? "Sold out" : `${v.available} left`}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
