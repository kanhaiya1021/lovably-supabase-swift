import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  MapPin,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Plus,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { CartSheet } from "@/components/shop/CartSheet";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Hearth & Clay" },
      { name: "description", content: "Manage your orders, profile, and shipping addresses." },
    ],
  }),
  component: Account,
});

function orderStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
    case "delivered":
      return <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">{status}</Badge>;
    case "processing":
    case "shipped":
      return <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-500/20">{status}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function Account() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // Address form state
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostal, setAddrPostal] = useState("");

  // Fetch user profile and roles
  const { data: userDetails, isLoading: userLoading } = useQuery({
    queryKey: ["account-user"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not logged in");
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
      ]);
      return {
        id: u.user.id,
        email: u.user.email,
        fullName: profile?.full_name ?? "",
        roles: roles?.map((r) => r.role) ?? [],
      };
    },
  });

  // Fetch user orders with items
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["account-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          grand_total,
          currency,
          created_at,
          order_items (
            id,
            product_name,
            variant_name,
            quantity,
            unit_price
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch saved addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["account-addresses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: async () => {
      if (!userDetails?.id) throw new Error("User missing");
      const { error } = await supabase.from("addresses").insert({
        user_id: userDetails.id,
        full_name: addrName,
        phone: addrPhone,
        line1: addrLine1,
        city: addrCity,
        state: addrState,
        postal_code: addrPostal,
        country: "IN",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Address saved successfully");
      queryClient.invalidateQueries({ queryKey: ["account-addresses"] });
      setAddressModalOpen(false);
      setAddrName("");
      setAddrPhone("");
      setAddrLine1("");
      setAddrCity("");
      setAddrState("");
      setAddrPostal("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save address");
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  const isAdmin = userDetails?.roles.includes("admin");

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <SiteHeader />
      <CartSheet />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 md:py-14">
        {/* Page Title & Profile Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Customer Portal</span>
              {isAdmin && (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  Admin Access
                </Badge>
              )}
            </div>
            <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
              Hello, {userDetails?.fullName || userDetails?.email?.split("@")[0] || "there"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{userDetails?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 rounded-lg">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="mt-8">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-xs rounded-xl p-1 bg-muted/60">
              <TabsTrigger value="orders" className="gap-2 rounded-lg text-xs font-medium">
                <Package className="h-4 w-4" />
                Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-2 rounded-lg text-xs font-medium">
                <MapPin className="h-4 w-4" />
                Addresses ({addresses.length})
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <h3 className="mt-4 font-display text-lg font-medium">No orders yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When you place an order, it will appear here with live tracking.
                  </p>
                  <Button asChild className="mt-6 rounded-full" size="sm">
                    <Link to="/">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs transition-all hover:border-border"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            Order #{order.order_number}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {orderStatusBadge(order.status)}
                          <Button asChild variant="ghost" size="sm" className="gap-1 rounded-lg text-xs">
                            <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                              View Details
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="mt-4 space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {item.product_name} ({item.variant_name}) × {item.quantity}
                            </span>
                            <span className="font-medium text-foreground">
                              {formatPrice(item.unit_price * item.quantity, order.currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-between border-t border-border/40 pt-3 text-sm">
                        <span className="font-medium text-muted-foreground">Total Amount</span>
                        <span className="font-bold text-foreground">
                          {formatPrice(order.grand_total, order.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-medium">Saved Addresses</h3>
                  <p className="text-xs text-muted-foreground">Manage your shipping destinations</p>
                </div>

                <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 rounded-lg">
                      <Plus className="h-4 w-4" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl">New Shipping Address</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        addAddressMutation.mutate();
                      }}
                      className="space-y-3 pt-2"
                    >
                      <div className="space-y-1">
                        <Label htmlFor="aname" className="text-xs">Full Name</Label>
                        <Input
                          id="aname"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          placeholder="Recipient name"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="aphone" className="text-xs">Phone Number</Label>
                        <Input
                          id="aphone"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          placeholder="10-digit mobile"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="aline1" className="text-xs">Street Address</Label>
                        <Input
                          id="aline1"
                          value={addrLine1}
                          onChange={(e) => setAddrLine1(e.target.value)}
                          placeholder="House/flat no, building, street"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="acity" className="text-xs">City</Label>
                          <Input
                            id="acity"
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            placeholder="City"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="astate" className="text-xs">State</Label>
                          <Input
                            id="astate"
                            value={addrState}
                            onChange={(e) => setAddrState(e.target.value)}
                            placeholder="State"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="apostal" className="text-xs">PIN Code</Label>
                        <Input
                          id="apostal"
                          value={addrPostal}
                          onChange={(e) => setAddrPostal(e.target.value)}
                          placeholder="6-digit PIN"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full mt-2 rounded-lg"
                        disabled={addAddressMutation.isPending}
                      >
                        {addAddressMutation.isPending ? "Saving..." : "Save Address"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {addressesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                  <MapPin className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <h3 className="mt-4 font-display text-lg font-medium">No saved addresses</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save your address to checkout faster next time.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs space-y-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{a.full_name}</p>
                        {a.is_default && (
                          <Badge variant="secondary" className="text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.phone}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.postal_code}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
