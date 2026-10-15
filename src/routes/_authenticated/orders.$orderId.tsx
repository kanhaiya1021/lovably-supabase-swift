import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order confirmed — Hearth & Clay" },
      { name: "description", content: "Your order details and delivery address." },
      { property: "og:title", content: "Order confirmed — Hearth & Clay" },
      { property: "og:description", content: "Your order details and delivery address." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderPage,
});

type Addr = { full_name: string; phone: string; line1: string; line2?: string; city: string; state: string; postal_code: string };

function OrderPage() {
  const { orderId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const [{ data: order }, { data: items }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);
      return { order, items: items ?? [] };
    },
  });

  if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  const order = data?.order;
  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Order not found</h1>
        <Button asChild className="mt-6"><Link to="/">Back to shop</Link></Button>
      </main>
    );
  }
  const addr = order.shipping_address as unknown as Addr;
  const cur = order.currency;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-display text-4xl">Thank you for your order</h1>
        <p className="mt-2 text-muted-foreground">Order #{order.order_number} · Status: <span className="capitalize">{order.status.replace("_", " ")}</span></p>
      </div>
      <section className="rounded-lg border p-6">
        <ul className="divide-y">
          {data.items.map((i) => (
            <li key={i.id} className="flex justify-between py-3 text-sm">
              <span>{i.product_name} <span className="text-muted-foreground">({i.variant_name}) × {i.quantity}</span></span>
              <span>{formatPrice(Number(i.line_total), cur)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(Number(order.subtotal), cur)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{Number(order.shipping_total) === 0 ? "Free" : formatPrice(Number(order.shipping_total), cur)}</span></div>
          <div className="flex justify-between pt-2 text-lg font-semibold"><span>Total</span><span>{formatPrice(Number(order.grand_total), cur)}</span></div>
        </div>
      </section>
      <section className="rounded-lg border p-6 text-sm">
        <h2 className="mb-2 font-medium">Delivering to</h2>
        <p>{addr.full_name} · {addr.phone}</p>
        <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.postal_code}</p>
      </section>
      <p className="text-center text-sm text-muted-foreground">Online payment is coming soon — we'll contact you to confirm.</p>
      <div className="text-center"><Button asChild variant="outline"><Link to="/">Continue shopping</Link></Button></div>
    </main>
  );
}
