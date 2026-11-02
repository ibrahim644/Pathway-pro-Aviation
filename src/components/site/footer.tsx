import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin } from "lucide-react";
import logoAsset from "@/assets/ppat-logo.png.asset.json";

import { settingsQuery, SETTINGS_FALLBACK, coursesQuery } from "@/lib/content";

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: courses } = useQuery(coursesQuery);
  const s = settings ?? SETTINGS_FALLBACK;

  return (
    <footer className="no-print surface-navy mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="public/ppat-logo.png"
              alt="Pathway Pro Aviation Training logo"
              className="size-11 rounded-md bg-background object-contain p-0.5"
              width={44}
              height={44}
            />
            <span className="font-display text-lg font-bold uppercase">Pathway Pro</span>
          </div>
          <p className="mt-4 text-sm opacity-75">
            Training the next generation of Nigerian pilots, engineers, cabin crew and aviation
            professionals to international standards.
          </p>
        </div>

        <div>
          <h3 className="eyebrow mb-4 opacity-70">Programmes</h3>
          <ul className="space-y-2 text-sm opacity-85">
            {(courses ?? []).slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to="/courses/$slug" params={{ slug: c.slug }} className="hover:opacity-100">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4 opacity-70">Quick links</h3>
          <ul className="space-y-2 text-sm opacity-85">
            <li>
              <Link to="/admissions">Admissions</Link>
            </li>
            <li>
              <Link to="/brochures">Downloadable brochures</Link>
            </li>
            <li>
              <Link to="/verify">Certificate verification</Link>
            </li>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/news">News &amp; blog</Link>
            </li>
            <li>
              <Link to="/portal">Applicant portal</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4 opacity-70">Contact</h3>
          <ul className="space-y-3 text-sm opacity-85">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {s.address}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0" /> {s.phone}
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0" /> {s.email}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sidebar-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs opacity-60 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Pathway Pro Aviation Training. All rights reserved.</span>
          <span>{s.office_hours}</span>
        </div>
      </div>
    </footer>
  );
}
