import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { brochuresQuery } from "@/lib/content";

export const Route = createFileRoute("/brochures")({
  head: () => ({
    meta: [
      { title: "Downloadable Brochures & Prospectus — Pathway Pro" },
      {
        name: "description",
        content:
          "Download the Pathway Pro Aviation Training prospectus and programme brochures covering fees, requirements and course structure.",
      },
      { property: "og:title", content: "Brochures & Prospectus — Pathway Pro" },
      { property: "og:description", content: "Download our prospectus and programme brochures." },
      { property: "og:url", content: "/brochures" },
    ],
    links: [{ rel: "canonical", href: "/brochures" }],
  }),
  component: Brochures,
});

function Brochures() {
  const { data: brochures } = useQuery(brochuresQuery);

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Downloadable brochures"
        subtitle="Everything you need to plan your training — programme structure, fees, facilities and admission requirements."
      />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {(brochures ?? []).map((item) => (
            <Card key={item.id} className="shadow-card">
              <CardContent className="pt-6">
                <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <h2 className="mt-4 text-xl">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <Button asChild className="mt-5">
                  <a href={item.file_url} download>
                    <Download className="size-4" /> Download PDF
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Brochure files are managed from the admin dashboard — upload a new PDF there and it will
          appear on this page automatically.
        </p>
      </section>
    </>
  );
}
