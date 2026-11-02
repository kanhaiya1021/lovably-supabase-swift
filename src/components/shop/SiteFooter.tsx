import { Link } from "@tanstack/react-router";
import { Mail, Clock, ShieldCheck, Truck, RotateCcw, Store } from "lucide-react";

const cols: [string, string[]][] = [
  ["About", ["Our Artisans", "Craft Stories", "Careers", "Press"]],
  ["Help", ["Payments", "Shipping", "Cancellation & Returns", "FAQ"]],
  ["Policy", ["Return Policy", "Terms of Use", "Security", "Privacy"]],
];

export function SiteFooter() {
  return (
    <footer className="mt-6 bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-xs sm:grid-cols-2 lg:grid-cols-5">
        {cols.map(([h, items]) => (
          <div key={h}>
            <p className="mb-3 font-semibold uppercase opacity-60">{h}</p>
            <ul className="space-y-2 font-medium">
              {items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
        ))}
        <div className="border-background/20 lg:col-span-2 lg:border-l lg:pl-8">
          <p className="mb-3 font-semibold uppercase opacity-60">Contact us</p>
          <div className="space-y-2 font-medium">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@hearthclay.in</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> Mon – Sat, 10:00 – 19:00 IST</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Safe & server-verified checkout</p>
          </div>
        </div>
      </div>
      <div className="border-t border-background/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-6 py-5 text-xs font-medium md:justify-between">
          <span className="flex items-center gap-1.5"><Store className="h-4 w-4 text-highlight" /> <Link to="/">Hearth & Clay</Link></span>
          <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-highlight" /> Free delivery over ₹2,999</span>
          <span className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4 text-highlight" /> 7-day returns</span>
          <span>© {new Date().getFullYear()} Hearth & Clay</span>
        </div>
      </div>
    </footer>
  );
}
