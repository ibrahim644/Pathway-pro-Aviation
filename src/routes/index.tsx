import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Plane,
  Wrench,
  Radio,
  GraduationCap,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import heroImage from "@/assets/hero-aircraft.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { coursesQuery, newsQuery, naira, prettyDate } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pathway Pro Aviation Training — Pilot & Aviation School in Kano" },
      {
        name: "description",
        content:
          "Train as a pilot, aircraft maintenance engineer, cabin crew or air traffic controller at Pathway Pro Aviation Training, Kano. Apply online today.",
      },
      { property: "og:title", content: "Pathway Pro Aviation Training — Pilot & Aviation School in Kano" },
      {
        property: "og:description",
        content: "Train as a pilot, aircraft maintenance engineer, cabin crew or air traffic controller at Pathway Pro Aviation Training, Kano. Apply online today.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const STATS = [
  { value: "1,200+", label: "Graduates trained" },
  { value: "18", label: "Aircraft & simulators" },
  { value: "96%", label: "Licence pass rate" },
  { value: "22", label: "Industry partners" },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Regulator-aligned",
    body: "Every programme follows NCAA and ICAO syllabi, with examiners on site for licence testing.",
  },
  {
    icon: Plane,
    title: "Real flight hours",
    body: "Cadets log hours in our own fleet, not just simulators — from first solo to night rating.",
  },
  {
    icon: Wrench,
    title: "Hands-on hangar",
    body: "Engineering students work on live airframes and powerplants under licensed supervision.",
  },
  {
    icon: GraduationCap,
    title: "Placement support",
    body: "Career services connects graduates with partner airlines, MROs and handling companies.",
  },
];

function Home() {
  const { data: courses } = useQuery(coursesQuery);
  const { data: news } = useQuery(newsQuery);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy text-navy-foreground">
        <img
          src={heroImage}
          alt="Training aircraft on the runway at sunset"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-navy-foreground/25 px-3 py-1 text-navy-foreground/85">
              <Radio className="size-3.5" /> 2026 cadet intake open
            </span>
            <h1 className="mt-6 font-display text-5xl uppercase leading-[0.95] md:text-7xl">
              Your career in
              <br />
              aviation starts
              <br />
              <span className="text-primary">on this runway</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-navy-foreground/80">
              Pathway Pro trains pilots, aircraft maintenance engineers, cabin crew and air
              traffic controllers to international standards — right here in Arewa.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/portal/apply">
                  Start your application <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-navy-foreground/30 bg-transparent text-navy-foreground hover:bg-navy-foreground/10">
                <Link to="/courses">Explore programmes</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px self-end overflow-hidden rounded-lg border border-navy-foreground/15 bg-navy-foreground/15">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-navy/85 p-6">
                <div className="font-display text-4xl text-accent">{stat.value}</div>
                <div className="mt-1 text-sm text-navy-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <span className="eyebrow text-primary">Why Pathway Pro</span>
          <h2 className="mt-3 text-4xl">Training built around the flight deck, not the classroom</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <Card key={p.title} className="shadow-card">
              <CardContent className="pt-6">
                <span className="flex size-11 items-center justify-center rounded-md bg-accent/12 text-accent">
                  <p.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="border-y border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="eyebrow text-primary">Programmes</span>
              <h2 className="mt-3 text-4xl">Choose your pathway</h2>
            </div>
            <Button asChild variant="ghost">
              <Link to="/courses">
                All programmes <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(courses ?? []).slice(0, 6).map((course) => (
              <Card key={course.id} className="flex flex-col shadow-card transition-shadow hover:shadow-lift">
                <CardContent className="flex flex-1 flex-col pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="size-3" /> {course.duration}
                    </Badge>
                  </div>
                  <h3 className="mt-4 text-2xl">{course.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{course.summary}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-display text-lg text-primary">
                      {naira(course.tuition_fee)}
                    </span>
                    <Link
                      to="/courses/$slug"
                      params={{ slug: course.slug }}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-accent"
                    >
                      Details <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions strip */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-primary">Admissions</span>
            <h2 className="mt-3 text-4xl">Apply online in five steps</h2>
            <p className="mt-4 text-muted-foreground">
              Our admission portal lets you save your application as a draft, upload documents and
              track your status from submission to decision.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Create an account and verify your email",
                "Complete the application form and pick your programme",
                "Upload your credentials and passport photograph",
                "Pay the application fee with Paystack or Flutterwave",
                "Track your status and download your admission letter",
              ].map((step) => (
                <li key={step} className="flex gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  {step}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-9">
              <Link to="/admissions">Admission requirements</Link>
            </Button>
          </div>

          <Card className="surface-navy border-0 shadow-lift">
            <CardContent className="p-8">
              <h3 className="text-2xl">Already applied?</h3>
              <p className="mt-2 text-sm text-navy-foreground/75">
                Sign in to your portal to continue a draft, upload outstanding documents, view
                payments or print your application form.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/portal">Open my portal</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-navy-foreground/30 bg-transparent text-navy-foreground hover:bg-navy-foreground/10"
                >
                  <Link to="/verify">Verify a certificate</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* News */}
      <section className="border-t border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-primary">Newsroom</span>
              <h2 className="mt-3 text-4xl">Latest from the airfield</h2>
            </div>
            <Button asChild variant="ghost">
              <Link to="/news">
                All news <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(news ?? []).slice(0, 3).map((post) => (
              <Card key={post.id} className="shadow-card">
                <CardContent className="pt-6">
                  <span className="eyebrow text-muted-foreground">
                    {prettyDate(post.published_at)}
                  </span>
                  <h3 className="mt-3 text-xl">
                    <Link to="/news/$slug" params={{ slug: post.slug }}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
