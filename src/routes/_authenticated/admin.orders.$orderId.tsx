import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/catalog";
import { adminHead, ORDER_STATUSES, statusLabel, type OrderStatus } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/orders/$orderId")({
  head: () => adminHead("Order details"),
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const qc = useQueryClient();
  const { data: o, isLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders")
        .select("*, order_items(*), payments(*), order_status_events(*), coupons(code)")
        .eq("id", orderId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const update = useMutation({
    mutationFn: async (status: OrderStatus) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin-order", orderId] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" />;
  if (!o) return <p className="rounded-lg bg-card p-6 text-center">Order not found. <Link to="/admin/orders" className="text-primary">Back</Link></p>;

  const a = o.shipping_address as Record<string, string>;
  const events = [...o.order_status_events].sort((x, y) => x.created_at.localeCompare(y.created_at));
  const coupon = Array.isArray(o.coupons) ? o.coupons[0] : o.coupons;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm"><Link to="/admin/orders"><ArrowLeft className="mr-1 h-4 w-4" />Orders</Link></Button>
        <h1 className="font-display text-2xl font-semibold">Order #{o.order_number}</h1>
        <Badge variant="secondary" className="capitalize">{statusLabel(o.status)}</Badge>
        <div className="ml-auto flex items-center gap-2">
          <select value={o.status} disabled={update.isPending} onChange={(e) => update.mutate(e.target.value as OrderStatus)}
            className="rounded-md border bg-background px-2 py-1.5 text-sm capitalize" aria-label="Change status">
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" />Print</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Placed {new Date(o.created_at).toLocaleString("en-IN")}</p>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg bg-card p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-2 font-semibold">Items</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr><th className="py-1">Product</th><th>SKU</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {o.order_items.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="py-2">{i.product_name}<span className="block text-xs text-muted-foreground">{i.variant_name}</span></td>
                  <td>{i.sku}</td><td>{i.quantity}</td>
                  <td className="text-right">{formatPrice(Number(i.unit_price), o.currency)}</td>
                  <td className="text-right">{formatPrice(Number(i.line_total), o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ml-auto mt-3 max-w-xs space-y-1 text-sm">
            <Row k="Subtotal" v={formatPrice(Number(o.subtotal), o.currency)} />
            <Row k={`Discount${coupon ? ` (${coupon.code})` : ""}`} v={`− ${formatPrice(Number(o.discount_total), o.currency)}`} />
            <Row k="Delivery" v={formatPrice(Number(o.shipping_total), o.currency)} />
            <Row k="Tax" v={formatPrice(Number(o.tax_total), o.currency)} />
            <div className="flex justify-between border-t pt-1 font-semibold"><dt>Total</dt><dd>{formatPrice(Number(o.grand_total), o.currency)}</dd></div>
          </dl>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg bg-card p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Ship to</h2>
            <p className="font-medium">{a.full_name}</p>
            <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
            <p>{a.city}, {a.state} {a.postal_code}</p>
            <p className="text-muted-foreground">{a.phone}</p>
          </div>
          <div className="rounded-lg bg-card p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Payment</h2>
            {o.payments.length === 0 ? <p className="text-muted-foreground">No payment recorded yet.</p> : o.payments.map((p) => (
              <p key={p.id} className="flex justify-between capitalize"><span>{p.provider} · {p.status}</span><span>{formatPrice(Number(p.amount), p.currency)}</span></p>
            ))}
          </div>
          <div className="rounded-lg bg-card p-4 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Status history</h2>
            {events.length === 0 ? <p className="text-muted-foreground">No changes recorded yet.</p> : (
              <ol className="space-y-2 border-l pl-3">
                {events.map((e) => (
                  <li key={e.id}>
                    <span className="capitalize">{e.from_status ? `${statusLabel(e.from_status)} → ` : "Created as "}<b>{statusLabel(e.to_status)}</b></span>
                    <span className="block text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>;
}
