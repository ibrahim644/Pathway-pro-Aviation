import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHero } from "@/components/site/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { newsQuery, prettyDate } from "@/lib/content";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News & Blog — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Announcements, intake news, safety features and student stories from Pathway Pro Aviation Training in Lagos.",
      },
      { property: "og:title", content: "News & Blog — Pathway Pro" },
      { property: "og:description", content: "Announcements and stories from the airfield." },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: News,
});

function News() {
  const { data: posts } = useQuery(newsQuery);

  return (
    <>
      <PageHero
        eyebrow="Newsroom"
        title="News & blog"
        subtitle="Intake announcements, facility upgrades, safety features and stories from our cadets."
      />
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="space-y-6">
          {(posts ?? []).map((post) => (
            <Card key={post.id} className="shadow-card transition-shadow hover:shadow-lift">
              <CardContent className="pt-6">
                <span className="eyebrow text-muted-foreground">
                  {prettyDate(post.published_at)}
                </span>
                <h2 className="mt-2 text-2xl">
                  <Link to="/news/$slug" params={{ slug: post.slug }}>
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
                <Link
                  to="/news/$slug"
                  params={{ slug: post.slug }}
                  className="mt-4 inline-block text-sm font-semibold text-accent"
                >
                  Read more →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
