import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { toast } from "sonner";

import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { settingsQuery, SETTINGS_FALLBACK } from "@/lib/content";
import { submitContactMessage, contactSchema } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Pathway Pro Aviation Training, Lagos" },
      {
        name: "description",
        content:
          "Call, email, WhatsApp or visit Pathway Pro Aviation Training at the General Aviation Terminal, Murtala Muhammed Airport, Lagos.",
      },
      { property: "og:title", content: "Contact Pathway Pro Aviation Training" },
      { property: "og:description", content: "Phone, email, WhatsApp and directions to our campus." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { data: settings } = useQuery(settingsQuery);
  const s = settings ?? SETTINGS_FALLBACK;
  const send = useServerFn(submitContactMessage);
  const [sending, setSending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSending(true);
    try {
      const result = await send({ data: parsed.data });
      if (result.ok) {
        toast.success("Message sent. Our admissions desk will reply shortly.");
        form.reset();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const details = [
    { icon: MapPin, label: "Campus", value: s.address },
    { icon: Phone, label: "Phone", value: s.phone },
    { icon: Mail, label: "Email", value: s.email },
    { icon: Clock, label: "Office hours", value: s.office_hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact us"
        subtitle="Speak to our admissions desk about programmes, fees, medicals or campus visits."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {details.map((d) => (
              <Card key={d.label} className="shadow-card">
                <CardContent className="flex gap-4 pt-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/12 text-accent">
                    <d.icon className="size-5" />
                  </span>
                  <div>
                    <div className="eyebrow text-muted-foreground">{d.label}</div>
                    <div className="mt-1 text-sm">{d.value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-lift">
            <CardContent className="pt-6">
              <h2 className="text-2xl">Send us a message</h2>
              <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" name="name" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required maxLength={255} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" maxLength={30} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" maxLength={150} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={6} required maxLength={2000} />
                </div>
                <Button type="submit" size="lg" disabled={sending}>
                  {sending ? "Sending…" : "Send message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-14 overflow-hidden rounded-lg border border-border shadow-card">
          <iframe
            title="Pathway Pro Aviation Training location"
            src={s.map_embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[420px] w-full border-0"
          />
        </div>
      </section>
    </>
  );
}
