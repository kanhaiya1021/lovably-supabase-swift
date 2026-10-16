import { Link } from "@tanstack/react-router";
import {
  Instagram,
  X,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  Clock,
  CreditCard,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background text-muted-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Column 1: Brand & Mission */}
          <div>
            <Link to="/" className="font-display text-xl font-semibold tracking-tight">
              Hearth & Clay
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Handcrafted ceramics, textiles and home goods made by independent artisans
              across India. Slow design, lasting quality.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter/X"
              >
                <X className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Shop
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Headphones</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Living</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Decor</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Kitchenware</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Customer Care
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Returns & Exchange</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 4: Contact & Assurance */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Contact & Assurance
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>support@hearthclay.in</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>Mon - Sat: 10:00 - 19:00 IST</span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>Safe & Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Hearth & Clay. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
          <span className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium">
            Designed with craft
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.21L7 14.14 2 9.27l6.91-1.02L12 2z" />
            </svg>
          </span>
        </div>
      </div>
    </footer>
  );
}