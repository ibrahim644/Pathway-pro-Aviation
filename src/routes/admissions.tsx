import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, FileText, Upload, CreditCard, BadgeCheck } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { coursesQuery, naira } from "@/lib/content";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "Admissions & How to Apply — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Admission requirements, application steps, fees and key dates for pilot, engineering and cabin crew training at Pathway Pro Aviation Training.",
      },
      { property: "og:title", content: "Admissions — Pathway Pro Aviation Training" },
      {
        property: "og:description",
        content: "How to apply online, entry requirements and application fees.",
      },
      { property: "og:url", content: "/admissions" },
    ],
    links: [{ rel: "canonical", href: "/admissions" }],
  }),
  component: Admissions,
});

const STEPS = [
  { icon: UserPlus, title: "Create your account", body: "Register with your email address and verify it from your inbox." },
  { icon: FileText, title: "Complete the form", body: "Fill in your bio-data, education history and preferred programme. Save as draft any time." },
  { icon: Upload, title: "Upload documents", body: "Passport photograph, valid ID, O'Level result, birth certificate and medical where required." },
  { icon: CreditCard, title: "Pay the application fee", body: "Pay securely with Paystack or Flutterwave and download your receipt instantly." },
  { icon: BadgeCheck, title: "Track your decision", body: "Follow your status from Submitted through Under Review to Approved." },
];

function Admissions() {
  const { data: courses } = useQuery(coursesQuery);

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="How to apply"
        subtitle="Applications for the 2026 intake are open. The whole process happens online — no paperwork queues, no runaround."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <Card key={step.title} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-md bg-accent/12 text-accent">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl text-muted-foreground/30">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-3xl">General entry requirements</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>• A minimum of five O'Level credits including English Language and Mathematics.</li>
              <li>• Valid means of identification (national ID, passport or driver's licence).</li>
              <li>• Birth certificate or declaration of age.</li>
              <li>• Recent passport photograph on a white background.</li>
              <li>• Medical certificate of the class required by your chosen programme.</li>
              <li>• Payment of the non-refundable application fee for your programme.</li>
            </ul>

            <h2 className="mt-12 text-3xl">Key dates</h2>
            <div className="mt-5 overflow-hidden rounded-lg border border-border">
              {[
                ["Application opens", "5 January 2026"],
                ["Application closes", "30 April 2026"],
                ["Entrance screening & medicals", "12 – 23 May 2026"],
                ["Admission letters issued", "5 June 2026"],
                ["Registration & resumption", "6 July 2026"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-border px-4 py-3 text-sm last:border-0 odd:bg-muted/40"
                >
                  <span>{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="h-fit shadow-lift">
            <CardContent className="pt-6">
              <h3 className="text-2xl">Application fees</h3>
              <div className="mt-4 space-y-3">
                {(courses ?? []).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 border-b border-border pb-2 text-sm last:border-0">
                    <span>{c.title}</span>
                    <span className="font-display text-base text-primary">
                      {naira(c.application_fee)}
                    </span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="mt-7 w-full">
                <Link to="/portal/apply">Start your application</Link>
              </Button>
              <Button asChild variant="outline" className="mt-3 w-full">
                <Link to="/brochures">Download the prospectus</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
