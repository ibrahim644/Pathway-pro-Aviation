import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { galleryQuery } from "@/lib/content";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Photos of our training fleet, simulator hall, engineering hangar, cabin crew mock-up and campus life at Pathway Pro Aviation Training.",
      },
      { property: "og:title", content: "Gallery — Pathway Pro Aviation Training" },
      { property: "og:description", content: "Inside our fleet, hangar, simulators and campus." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

function Gallery() {
  const { data: images } = useQuery(galleryQuery);
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set((images ?? []).map((i) => i.category)))];
  const visible = (images ?? []).filter((i) => filter === "All" || i.category === filter);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Inside Pathway Pro"
        subtitle="Our fleet, hangar, simulator hall, cabin mock-up and the people who make it all work."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={filter === cat ? "default" : "outline"}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((image) => (
            <figure
              key={image.id}
              className="group overflow-hidden rounded-lg border border-border shadow-card"
            >
              <img
                src={image.image_url}
                alt={image.title}
                loading="lazy"
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="flex items-center justify-between gap-3 bg-card px-4 py-3 text-sm">
                <span>{image.title}</span>
                <span className="text-xs text-muted-foreground">{image.category}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
