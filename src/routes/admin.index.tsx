import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileDown, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { AdminMfaGate } from "@/components/site/admin-mfa-gate";
import { AdminCourses } from "@/components/site/admin-courses";
import { useAuth, fetchIsAdmin } from "@/lib/use-auth";
import { naira, prettyDate } from "@/lib/content";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Staff dashboard for reviewing applications, documents, payments, enquiries and certificates.",
      },
      { property: "og:title", content: "Admin dashboard — Pathway Pro" },
      { property: "og:description", content: "Review applications and manage admissions." },
      { property: "og:url", content: "/admin" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <AdminGuard>
      <AdminMfaGate>
        <AdminDashboard />
      </AdminMfaGate>
    </AdminGuard>
  );
}

/** Session + staff-role check; MFA runs only once the account is known to be staff. */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const userId = session?.user.id;

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: { next: undefined }, replace: true });
  }, [loading, session, navigate]);

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: () => fetchIsAdmin(userId!),
  });

  if (loading || roleLoading || (!!userId && isAdmin === undefined))
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!isAdmin)
    return (
      <section className="mx-auto max-w-lg px-6 py-24 text-center">
        <ShieldCheck className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 text-3xl">Staff access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn't have admin or staff permissions for this dashboard.
        </p>
      </section>
    );

  return <>{children}</>;
}

const STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "documents_requested",
  "approved",
  "rejected",
] as const;

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAdmin = true;



  const { data: applications } = useQuery({
    queryKey: ["admin-applications"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, courses(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["admin-messages"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["admin-payments"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: certificates } = useQuery({
    queryKey: ["admin-certificates"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });




  const apps = applications ?? [];
  const stats = [
    { label: "Applications", value: apps.length },
    { label: "Awaiting review", value: apps.filter((a) => a.status === "submitted").length },
    { label: "Approved", value: apps.filter((a) => a.status === "approved").length },
    {
      label: "Fees collected",
      value: naira(
        (payments ?? [])
          .filter((p) => p.status === "success")
          .reduce((sum, p) => sum + Number(p.amount), 0),
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-primary">Administration</span>
          <h1 className="mt-2 text-4xl">Admissions dashboard</h1>
        </div>
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="pt-6">
              <div className="eyebrow text-muted-foreground">{s.label}</div>
              <div className="mt-1 font-display text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="applications" className="mt-10">
        <TabsList className="flex-wrap">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="messages">Enquiries</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="pt-6">
          <AdminCourses />
        </TabsContent>

        <TabsContent value="applications" className="space-y-4 pt-6">
          {apps.length === 0 && (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          )}
          {apps.map((app) => (
            <ApplicationRow
              key={app.id}
              app={app}
              onChanged={() => qc.invalidateQueries({ queryKey: ["admin-applications"] })}
            />
          ))}
        </TabsContent>

        <TabsContent value="payments" className="pt-6">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              {(payments ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {(payments ?? []).map((p) => (
                    <li key={p.id} className="flex flex-wrap justify-between gap-3 py-3">
                      <span>
                        {p.reference} · {p.purpose.replace(/_/g, " ")} · {prettyDate(p.created_at)}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-display">{naira(Number(p.amount))}</span>
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
        </TabsContent>

        <TabsContent value="messages" className="space-y-4 pt-6">
          {(messages ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          )}
          {(messages ?? []).map((m) => (
            <Card key={m.id} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg">{m.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {m.name} · {m.email} {m.phone ? `· ${m.phone}` : ""} ·{" "}
                      {prettyDate(m.created_at)}
                    </p>
                  </div>
                  <Badge variant={m.handled ? "default" : "secondary"}>
                    {m.handled ? "Handled" : "New"}
                  </Badge>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm">{m.message}</p>
                {!m.handled && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("contact_messages")
                        .update({ handled: true })
                        .eq("id", m.id);
                      if (error) toast.error(error.message);
                      else qc.invalidateQueries({ queryKey: ["admin-messages"] });
                    }}
                  >
                    Mark handled
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="certificates" className="pt-6">
          <IssueCertificate
            onIssued={() => qc.invalidateQueries({ queryKey: ["admin-certificates"] })}
          />
          <Card className="mt-6 shadow-card">
            <CardContent className="pt-6">
              {(certificates ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No certificates issued yet.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {(certificates ?? []).map((c) => (
                    <li key={c.id} className="flex flex-wrap justify-between gap-3 py-3">
                      <span>
                        <strong>{c.certificate_number}</strong> · {c.graduate_name} ·{" "}
                        {c.course_title}
                      </span>
                      <Badge variant={c.is_valid ? "default" : "secondary"}>
                        {c.is_valid ? "Valid" : "Revoked"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

type AppRow = {
  id: string;
  application_number: string;
  status: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  admin_notes: string | null;
  created_at: string;
  courses: { title: string } | null;
};

function ApplicationRow({ app, onChanged }: { app: AppRow; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(app.admin_notes ?? "");

  const { data: documents } = useQuery({
    queryKey: ["admin-docs", app.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_documents")
        .select("*")
        .eq("application_id", app.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function updateStatus(status: string) {
    const { error } = await supabase
      .from("applications")
      .update({
        status: status as AppRow["status"] as never,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", app.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated.");
      onChanged();
    }
  }

  async function openDoc(path: string) {
    const { data, error } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(path, 300);
    if (error || !data) {
      toast.error(error?.message ?? "Could not open document.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow text-muted-foreground">{app.application_number}</div>
            <h3 className="mt-1 text-lg">{app.full_name ?? "Unnamed applicant"}</h3>
            <p className="text-sm text-muted-foreground">
              {app.courses?.title ?? "No programme"} · {app.email ?? "—"} ·{" "}
              {prettyDate(app.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={app.status} onValueChange={updateStatus}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
              {open ? "Hide" : "Review"}
            </Button>
          </div>
        </div>

        {open && (
          <div className="mt-6 space-y-4 border-t border-border pt-5">
            <div>
              <h4 className="eyebrow text-muted-foreground">Documents</h4>
              {(documents ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-sm">
                  {(documents ?? []).map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3">
                      <span>
                        {d.file_name}{" "}
                        <Badge variant="secondary">{d.doc_type.replace(/_/g, " ")}</Badge>
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => openDoc(d.file_path)}>
                        <FileDown className="size-4" /> Open
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`notes-${app.id}`}>Internal notes</Label>
              <Textarea
                id={`notes-${app.id}`}
                value={notes}
                maxLength={2000}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button
                size="sm"
                onClick={async () => {
                  const { error } = await supabase
                    .from("applications")
                    .update({ admin_notes: notes })
                    .eq("id", app.id);
                  if (error) toast.error(error.message);
                  else {
                    toast.success("Notes saved.");
                    onChanged();
                  }
                }}
              >
                Save notes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IssueCertificate({ onIssued }: { onIssued: () => void }) {
  const [busy, setBusy] = useState(false);

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6">
        <h3 className="text-lg">Issue a certificate</h3>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setBusy(true);
            const { error } = await supabase.from("certificates").insert({
              certificate_number: String(f.get("certificate_number")).trim().toUpperCase(),
              graduate_name: String(f.get("graduate_name")).trim(),
              course_title: String(f.get("course_title")).trim(),
              graduation_date: String(f.get("graduation_date")),
              grade: String(f.get("grade") ?? "") || null,
            });
            setBusy(false);
            if (error) {
              toast.error(error.message);
              return;
            }
            toast.success("Certificate issued.");
            e.currentTarget.reset();
            onIssued();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="certificate_number">Certificate number</Label>
            <Input id="certificate_number" name="certificate_number" required maxLength={40} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduate_name">Graduate name</Label>
            <Input id="graduate_name" name="graduate_name" required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course_title">Course title</Label>
            <Input id="course_title" name="course_title" required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduation_date">Graduation date</Label>
            <Input id="graduation_date" name="graduation_date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Input id="grade" name="grade" maxLength={40} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Issue certificate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
