import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageHero } from "@/components/site/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqsQuery } from "@/lib/content";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Answers to common questions about admissions, fees, documents, accommodation, certificate verification and career support at Pathway Pro.",
      },
      { property: "og:title", content: "FAQ — Pathway Pro Aviation Training" },
      { property: "og:description", content: "Common questions about admissions, fees and training." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: Faq,
});

function Faq() {
  const { data: faqs } = useQuery(faqsQuery);
  const groups = (faqs ?? []).reduce<Record<string, typeof faqs>>((acc, faq) => {
    (acc[faq.category] ||= []).push(faq);
    return acc;
  }, {});

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Frequently asked questions"
        subtitle="Can't find your answer? Our admissions desk replies to WhatsApp messages within one working day."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        {Object.entries(groups).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="eyebrow mb-3 text-primary">{category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {(items ?? []).map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </>
  );
}
