import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/ppat-logo.png.asset.json";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { settingsQuery, SETTINGS_FALLBACK } from "@/lib/content";
import { useAuth } from "@/lib/use-auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/admissions", label: "Admissions" },
  { to: "/news", label: "News" },
  { to: "/gallery", label: "Gallery" },
  { to: "/faq", label: "FAQ" },
  { to: "/verify", label: "Verify" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: settings } = useQuery(settingsQuery);
  const s = settings ?? SETTINGS_FALLBACK;
  const { session } = useAuth();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="surface-navy hidden text-xs md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <span className="opacity-80">{s.address}</span>
          <span className="flex items-center gap-5 opacity-90">
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:opacity-100">
              {s.phone}
            </a>
            <a href={`mailto:${s.email}`} className="hover:opacity-100">
              {s.email}
            </a>
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="public/ppat-logo.png"
            
            alt="Pathway Pro Aviation Training logo"
            className="size-12 object-contain"
            width={48}
            height={48}
          />
          <span className="leading-none">
            <span className="block font-display text-xl font-bold uppercase tracking-tight">
              Pathway Pro
            </span>
            <span className="eyebrow block text-[0.65rem] text-muted-foreground">
              Aviation Training
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  active ? "text-primary" : "text-foreground/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to={session ? "/portal" : "/auth"}>{session ? "My Portal" : "Sign in"}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/portal/apply">Apply Now</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-medium last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-4">
              <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                <Link to={session ? "/portal" : "/auth"}>{session ? "My Portal" : "Sign in"}</Link>
              </Button>
              <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                <Link to="/portal/apply">Apply Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
