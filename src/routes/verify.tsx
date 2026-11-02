import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, ShieldX, Search } from "lucide-react";

import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { prettyDate } from "@/lib/content";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Certificate Verification — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Employers and third parties can verify the authenticity of any Pathway Pro Aviation Training certificate using the certificate number.",
      },
      { property: "og:title", content: "Verify a Pathway Pro certificate" },
      {
        property: "og:description",
        content: "Confirm a graduate's name, programme and graduation date instantly.",
      },
      { property: "og:url", content: "/verify" },
    ],
    links: [{ rel: "canonical", href: "/verify" }],
  }),
  component: Verify,
});

type Certificate = {
  certificate_number: string;
  graduate_name: string;
  course_title: string;
  graduation_date: string;
  grade: string | null;
  is_valid: boolean;
};

function Verify() {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "found" | "missing">("idle");
  const [record, setRecord] = useState<Certificate | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const number = value.trim();
    if (!number) return;
    setState("loading");
    const { data } = await supabase
      .from("certificates")
      .select("certificate_number,graduate_name,course_title,graduation_date,grade,is_valid")
      .ilike("certificate_number", number)
      .maybeSingle();

    if (data) {
      setRecord(data as Certificate);
      setState("found");
    } else {
      setRecord(null);
      setState("missing");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Verification"
        title="Certificate verification"
        subtitle="Enter a certificate number to confirm that it was issued by Pathway Pro Aviation Training."
      />

      <section className="mx-auto max-w-2xl px-6 py-20">
        <Card className="shadow-lift">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cert">Certificate number</Label>
                <Input
                  id="cert"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. PPA/PPL/2025/0041"
                  maxLength={60}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={state === "loading"}>
                <Search className="size-4" />
                {state === "loading" ? "Checking…" : "Verify certificate"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {state === "found" && record && (
          <Card
            className={`mt-6 border-l-4 shadow-card ${
              record.is_valid ? "border-l-success" : "border-l-destructive"
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {record.is_valid ? (
                  <BadgeCheck className="size-6 text-success" />
                ) : (
                  <ShieldX className="size-6 text-destructive" />
                )}
                <h2 className="text-2xl">
                  {record.is_valid ? "Certificate is valid" : "Certificate has been revoked"}
                </h2>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Certificate number", record.certificate_number],
                  ["Graduate name", record.graduate_name],
                  ["Programme completed", record.course_title],
                  ["Graduation date", prettyDate(record.graduation_date)],
                  ["Grade", record.grade ?? "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <dt className="eyebrow text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium">{val}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {state === "missing" && (
          <Card className="mt-6 border-l-4 border-l-destructive shadow-card">
            <CardContent className="flex gap-3 pt-6">
              <ShieldX className="size-6 shrink-0 text-destructive" />
              <div>
                <h2 className="text-xl">No matching certificate</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  We could not find a certificate with that number. Check the number and try again,
                  or contact our registrar if you believe this is an error.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}
