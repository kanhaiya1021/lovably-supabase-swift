import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — Storefront" },
      { name: "description", content: "Your Storefront profile and orders." },
      { property: "og:title", content: "My account — Storefront" },
      { property: "og:description", content: "Your Storefront profile and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("full_name").maybeSingle(),
        supabase.from("user_roles").select("role"),
      ]);
      return { email: u.user?.email, profile, roles: roles?.map((r) => r.role) ?? [] };
    },
  });

  return (
    <main className="mx-auto max-w-xl space-y-4 px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">My account</h1>
      <div className="rounded-lg border border-border bg-card p-5 text-card-foreground">
        <p><span className="text-muted-foreground">Name:</span> {data?.profile?.full_name ?? "—"}</p>
        <p><span className="text-muted-foreground">Email:</span> {data?.email ?? "…"}</p>
        <p><span className="text-muted-foreground">Role:</span> {data?.roles.join(", ") || "…"}</p>
      </div>
      <Button
        variant="outline"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/" });
        }}
      >
        Sign out
      </Button>
    </main>
  );
}
