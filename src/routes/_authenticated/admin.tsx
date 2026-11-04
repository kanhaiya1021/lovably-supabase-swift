import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Loader2, ShieldAlert, LayoutDashboard, Package, Boxes, FolderTree, TicketPercent, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { adminHead, useIsAdmin } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => adminHead("Admin Panel"),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/customers", label: "Customers", icon: Users },
] as const;

function AdminLayout() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />
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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-6 sm:px-6 md:flex-row">
          <aside className="md:w-52 md:shrink-0">
            <nav className="flex gap-1 overflow-x-auto rounded-lg bg-card p-2 shadow-sm md:flex-col">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: "exact" in n }}
                  className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  activeProps={{ className: "bg-primary/10 font-semibold text-primary" }}
                >
                  <n.icon className="h-4 w-4" />{n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1"><Outlet /></main>
        </div>
      )}
    </div>
  );
}
