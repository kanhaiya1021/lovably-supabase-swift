import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Hearth & Clay" },
      { name: "description", content: "Sign in or create your Hearth & Clay account." },
      { property: "og:title", content: "Sign in — Hearth & Clay" },
      { property: "og:description", content: "Sign in or create your Hearth & Clay account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/account" },
      });
      if (error) setMsg(error.message);
      else if (data.session) navigate({ to: "/account" });
      else setMsg("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else navigate({ to: "/account" });
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      {/* Top Back Link */}
      <div className="w-full max-w-sm mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to store</span>
        </Link>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-lg">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight hover:opacity-90">
            Hearth & Clay
          </Link>
          <h1 className="mt-3 font-display text-xl font-medium text-card-foreground">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "signin"
              ? "Enter your credentials to access your orders"
              : "Sign up to track orders and save your details"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                placeholder="John Doe"
                className="h-10 rounded-lg text-sm"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 rounded-lg text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-lg text-sm"
              required
            />
          </div>

          {msg && (
            <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {msg}
            </div>
          )}

          <Button type="submit" className="w-full h-10 rounded-lg font-medium" disabled={busy}>
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait...
              </span>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setMsg(null);
              }}
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
