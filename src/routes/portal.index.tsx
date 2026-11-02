import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, CreditCard, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, fetchIsAdmin } from "@/lib/use-auth";
import { naira, prettyDate } from "@/lib/content";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "My Application Portal — Pathway Pro Aviation Training" },
      {
        name: "description",
        content: "Track your Pathway Pro application status, documents and payments.",
      },
      { property: "og:title", content: "My application portal — Pathway Pro" },
      { property: "og:description", content: "Track your application status and payments." },
      { property: "og:url", content: "/portal" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/portal" }],
  }),
  component: Portal,
});

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  documents_requested: "Documents requested",
  approved: "Approved",
  rejected: "Rejected",
};

function Portal() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const userId = session?.user.id;

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: { next: undefined }, replace: true });
  }, [loading, session, navigate]);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: () => fetchIsAdmin(userId!),
  });

  const { data: applications } = useQuery({
    queryKey: ["my-applications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, courses(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["my-payments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow text-primary">Applicant portal</span>
          <h1 className="mt-2 text-4xl">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">{session?.user.email}</p>
        </div>
        <div className="no-print flex gap-2">
          <Button asChild>
            <Link to="/portal/apply">New / continue application</Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="secondary">
              <Link to="/admin">Admin dashboard</Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/", replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <h2 className="mt-12 text-2xl">My applications</h2>
      <div className="mt-4 space-y-4">
        {(applications ?? []).length === 0 && (
          <Card className="shadow-card">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              You have no applications yet.{" "}
              <Link to="/portal/apply" className="font-semibold text-accent">
                Start one now
              </Link>
              .
            </CardContent>
          </Card>
        )}
        {(applications ?? []).map((app) => (
          <Card key={app.id} className="shadow-card">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div>
                <div className="eyebrow text-muted-foreground">{app.application_number}</div>
                <h3 className="mt-1 text-xl">
                  {(app.courses as { title: string } | null)?.title ?? "Programme not selected"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Created {prettyDate(app.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={app.status === "approved" ? "default" : "secondary"}>
                  {STATUS_LABEL[app.status] ?? app.status}
                </Badge>
                <Button asChild size="sm" variant="outline">
                  <Link to="/portal/apply">
                    <FileText className="size-4" /> Open
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.print()}>
                  <Printer className="size-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-2xl">Payment history</h2>
      <Card className="mt-4 shadow-card">
        <CardContent className="pt-6">
          {(payments ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payments recorded yet. Application and registration fees will appear here with
              downloadable receipts.
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {(payments ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="flex items-center gap-2">
                    <CreditCard className="size-4 text-muted-foreground" />
                    {p.purpose.replace("_", " ")} · {p.reference}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-display text-base">{naira(Number(p.amount))}</span>
                    <Badge variant={p.status === "success" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
