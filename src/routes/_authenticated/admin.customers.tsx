import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/catalog";
import { adminHead } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => adminHead("Customers"),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => { const { data, error } = await supabase.rpc("admin_customers"); if (error) throw error; return data; },
  });
  const rows = (data ?? []).filter((c) => `${c.email} ${c.full_name ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-semibold">Customers <span className="text-base font-normal text-muted-foreground">({data?.length ?? 0})</span></h1>
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone" className="pl-8" />
      </div>
      {isLoading ? <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin" /> : error ? <p className="text-destructive">{(error as Error).message}</p> : (
        <div className="overflow-x-auto rounded-lg bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground"><tr><th className="p-3">Customer</th><th className="p-3">Phone</th><th className="p-3">Joined</th><th className="p-3">Orders</th><th className="p-3">Spent</th><th className="p-3">Last order</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{c.full_name || "—"}<span className="block text-xs font-normal text-muted-foreground">{c.email}</span></td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">{c.order_count}</td>
                  <td className="p-3">{formatPrice(Number(c.total_spent), "INR")}</td>
                  <td className="p-3">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
