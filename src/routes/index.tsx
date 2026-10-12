import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Storefront — Shop the collection" },
      { name: "description", content: "Browse our products and shop securely." },
      { property: "og:title", content: "Storefront — Shop the collection" },
      { property: "og:description", content: "Browse our products and shop securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">Storefront</h1>
      <p className="max-w-md text-muted-foreground">
        The shop is being set up. Create an account to get started.
      </p>
      <div className="flex gap-3">
        <Button asChild><Link to="/auth">Sign in</Link></Button>
        <Button asChild variant="outline"><Link to="/account">My account</Link></Button>
      </div>
    </main>
  );
}
