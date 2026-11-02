import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHero } from "@/components/site/page-hero";
import { newsQuery, prettyDate } from "@/lib/content";

export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Article — Pathway Pro Aviation Training" },
      {
        name: "description",
        content: "Read the latest announcement from Pathway Pro Aviation Training.",
      },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "Article — Pathway Pro Aviation Training" },
      {
        property: "og:description",
        content: "Read the latest announcement from Pathway Pro Aviation Training.",
      },
      { property: "og:url", content: `/news/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/news/${params.slug}` }],
  }),
  component: NewsPost,
});

function NewsPost() {
  const { slug } = Route.useParams();
  const { data: posts, isLoading } = useQuery(newsQuery);
  const post = (posts ?? []).find((p) => p.slug === slug);

  if (!isLoading && !post) throw notFound();
  if (!post) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <PageHero eyebrow={prettyDate(post.published_at)} title={post.title} subtitle={post.excerpt} />
      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
          {post.body}
        </p>
        <Link to="/news" className="mt-10 inline-block text-sm font-semibold text-accent">
          ← Back to all news
        </Link>
      </article>
    </>
  );
}
