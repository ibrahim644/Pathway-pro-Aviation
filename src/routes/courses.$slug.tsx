import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { coursesQuery, naira, type Course } from "@/lib/content";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Course details — Pathway Pro Aviation Training` },
      {
        name: "description",
        content:
          "Programme structure, duration, tuition fees and admission requirements for this Pathway Pro aviation training programme.",
      },
      { property: "og:title", content: "Course details — Pathway Pro" },
      {
        property: "og:description",
        content: "Duration, fees and entry requirements for this aviation programme.",
      },
      { property: "og:url", content: `/courses/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/courses/${params.slug}` }],
  }),
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const { data: courses, isLoading } = useQuery(coursesQuery);
  const course: Course | undefined = (courses ?? []).find((c) => c.slug === slug);

  if (!isLoading && !course) throw notFound();
  if (!course) {
    return <div className="mx-auto max-w-7xl px-6 py-24 text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <PageHero eyebrow="Programme" title={course.title} subtitle={course.summary} />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="text-3xl">About this programme</h2>
            <p className="mt-4 text-muted-foreground">{course.description}</p>

            <h3 className="mt-10 text-2xl">Admission requirements</h3>
            <ul className="mt-4 space-y-3">
              {course.requirements.map((req) => (
                <li key={req} className="flex gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <Card className="h-fit shadow-lift">
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" /> {course.duration}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tuition</div>
                <div className="font-display text-3xl text-primary">{naira(course.tuition_fee)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Application fee</div>
                <div className="font-display text-2xl">{naira(course.application_fee)}</div>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link to="/portal/apply">Apply for this programme</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Speak to admissions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
