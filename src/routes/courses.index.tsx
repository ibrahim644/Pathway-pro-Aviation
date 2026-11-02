import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesQuery, naira } from "@/lib/content";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Aviation Courses & Programmes — Pathway Pro" },
      {
        name: "description",
        content:
          "Private and Commercial Pilot Licence, Aircraft Maintenance Engineering, Cabin Crew, Air Traffic Control and Aviation Management programmes with fees and requirements.",
      },
      { property: "og:title", content: "Aviation Courses — Pathway Pro" },
      {
        property: "og:description",
        content: "Explore our pilot, engineering, cabin crew and ATC training programmes.",
      },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: Courses,
});

function Courses() {
  const { data: courses, isLoading } = useQuery(coursesQuery);

  return (
    <>
      <PageHero
        eyebrow="Programmes"
        title="Courses & training pathways"
        subtitle="Every programme is delivered to NCAA and ICAO syllabi with licensed instructors, real aircraft time and independent assessment."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        {!isLoading && (courses ?? []).length === 0 && (
          <p className="text-muted-foreground">
            No programmes are published right now. Please check back soon.
          </p>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}


          {(courses ?? []).map((course) => (
            <Card key={course.id} className="flex flex-col shadow-card transition-shadow hover:shadow-lift">
              <CardContent className="flex flex-1 flex-col pt-6">
                <Badge variant="secondary" className="w-fit gap-1">
                  <Clock className="size-3" /> {course.duration}
                </Badge>
                <h2 className="mt-4 text-2xl">{course.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{course.summary}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Tuition</dt>
                    <dd className="font-display text-lg text-primary">{naira(course.tuition_fee)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Application fee</dt>
                    <dd className="font-display text-lg">{naira(course.application_fee)}</dd>
                  </div>
                </dl>
                <Link
                  to="/courses/$slug"
                  params={{ slug: course.slug }}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent"
                >
                  View requirements <ArrowRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
