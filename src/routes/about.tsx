import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, HeartHandshake } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Learn about Pathway Pro Aviation Training: our mission, instructors, facilities and approach to producing world-class aviation professionals in Nigeria.",
      },
      { property: "og:title", content: "About Pathway Pro Aviation Training" },
      {
        property: "og:description",
        content: "Our mission, facilities and instructors at Pathway Pro Aviation Training, Kano.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const VALUES = [
  {
    icon: Target,
    title: "Our mission",
    body: "To make world-class aviation training accessible in West Africa, producing professionals who meet the highest safety and competency standards.",
  },
  {
    icon: Eye,
    title: "Our vision",
    body: "To be the reference training organisation for African aviation — the school airlines look to first when they hire.",
  },
  {
    icon: HeartHandshake,
    title: "Our values",
    body: "Safety before schedule, integrity in assessment, discipline in the cockpit and respect for every trainee who walks through our gate.",
  },
];

const TEAM = [
  { name: "Capt. Emeka Nwosu", role: "Head of Training", detail: "ATPL, 12,000 hrs, ex-widebody captain" },
  { name: "Engr. Fatima Bello", role: "Chief Engineering Instructor", detail: "Licensed AME, airframe & powerplant" },
  { name: "Capt. Rita Adekunle", role: "Chief Flight Instructor", detail: "CFII, examiner, 6,400 hrs" },
  { name: "Mr. Samuel Oyelaran", role: "Registrar", detail: "Admissions, records and student affairs" },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Built by aviators, for aviators"
        subtitle="Pathway Pro Aviation Training was founded to close the gap between classroom theory and the discipline the flight deck actually demands."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5 text-muted-foreground">
            <h2 className="text-3xl text-foreground">Our story</h2>
            <p>
              Pathway Pro began as a small ground school run by three line captains who were tired
              of watching capable young Nigerians travel abroad for training that could be
              delivered at home. What started with a single classroom and a rented Cessna has grown
              into a full training organisation with its own fleet, simulator hall and engineering
              hangar.
            </p>
            <p>
              Today we train pilots, aircraft maintenance engineers, cabin crew, air traffic
              controllers and aviation managers. Our syllabi follow NCAA and ICAO requirements, our
              instructors hold current licences, and our assessment is independent — nobody
              graduates from Pathway Pro because they paid a fee.
            </p>
            <p>
              We measure ourselves on one number: how many of our graduates are working in aviation
              twelve months after they leave. Everything else — the facilities, the partnerships,
              the career services desk — exists to move that number.
            </p>
          </div>

          <div className="space-y-5">
            {VALUES.map((v) => (
              <Card key={v.title} className="shadow-card">
                <CardContent className="flex gap-4 pt-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <v.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg">{v.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <span className="eyebrow text-primary">Leadership</span>
          <h2 className="mt-3 text-4xl">The people in charge of your training</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <Card key={member.name} className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex size-14 items-center justify-center rounded-full bg-accent/12 font-display text-xl text-accent">
                    {member.name
                      .split(" ")
                      .slice(-2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <h3 className="mt-4 text-lg">{member.name}</h3>
                  <p className="text-sm font-semibold text-primary">{member.role}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{member.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
