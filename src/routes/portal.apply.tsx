import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Upload, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { coursesQuery, naira } from "@/lib/content";

export const Route = createFileRoute("/portal/apply")({
  head: () => ({
    meta: [
      { title: "Start an Application — Pathway Pro Aviation Training" },
      {
        name: "description",
        content:
          "Complete the Pathway Pro Aviation Training online application: personal details, programme choice, documents and payment.",
      },
      { property: "og:title", content: "Start an application — Pathway Pro" },
      { property: "og:description", content: "Apply online in a few guided steps." },
      { property: "og:url", content: "/portal/apply" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/portal/apply" }],
  }),
  component: Apply,
});

const STEPS = ["Programme", "Personal", "Education", "Documents", "Review"] as const;

const DOC_TYPES = [
  { value: "passport_photo", label: "Passport photograph" },
  { value: "birth_certificate", label: "Birth certificate / age declaration" },
  { value: "academic_certificate", label: "Academic certificate / result" },
  { value: "id_card", label: "Government issued ID" },
  { value: "medical_report", label: "Medical fitness report" },
  { value: "other", label: "Other supporting document" },
] as const;

type Draft = {
  course_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  state_of_origin: string;
  address: string;
  highest_qualification: string;
  institution_attended: string;
  year_completed: string;
  guardian_name: string;
  guardian_phone: string;
  personal_statement: string;
};

const EMPTY: Draft = {
  course_id: null,
  full_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  nationality: "Nigerian",
  state_of_origin: "",
  address: "",
  highest_qualification: "",
  institution_attended: "",
  year_completed: "",
  guardian_name: "",
  guardian_phone: "",
  personal_statement: "",
};

function Apply() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: { next: undefined }, replace: true });
  }, [loading, session, navigate]);

  const { data: courses } = useQuery(coursesQuery);

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ["draft-application", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId!)
        .in("status", ["draft", "documents_requested"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (hydrated || appLoading || !session) return;
    if (application) {
      setForm({
        ...EMPTY,
        ...Object.fromEntries(
          Object.keys(EMPTY).map((k) => [
            k,
            (application as Record<string, unknown>)[k] ?? EMPTY[k as keyof Draft],
          ]),
        ),
      } as Draft);
    } else {
      setForm((f) => ({
        ...f,
        full_name: (session.user.user_metadata?.["full_name"] as string) ?? "",
        email: session.user.email ?? "",
        phone: (session.user.user_metadata?.["phone"] as string) ?? "",
      }));
    }
    setHydrated(true);
  }, [application, appLoading, session, hydrated]);

  const applicationId = application?.id ?? null;

  const { data: documents } = useQuery({
    queryKey: ["application-documents", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_documents")
        .select("*")
        .eq("application_id", applicationId!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const selectedCourse = useMemo(
    () => (courses ?? []).find((c) => c.id === form.course_id) ?? null,
    [courses, form.course_id],
  );

  const save = useMutation({
    mutationFn: async (payload: Partial<Draft> & { status?: "draft" | "submitted" }) => {
      const body = { ...form, ...payload };
      if (applicationId) {
        const { error } = await supabase
          .from("applications")
          .update({
            ...body,
            date_of_birth: body.date_of_birth || null,
            ...(payload.status === "submitted"
              ? { status: "submitted" as const, submitted_at: new Date().toISOString() }
              : {}),
          })
          .eq("id", applicationId);
        if (error) throw error;
        return applicationId;
      }
      const { data, error } = await supabase
        .from("applications")
        .insert({
          ...body,
          user_id: userId!,
          date_of_birth: body.date_of_birth || null,
          status: payload.status === "submitted" ? "submitted" : "draft",
          ...(payload.status === "submitted" ? { submitted_at: new Date().toISOString() } : {}),
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["draft-application", userId] });
      qc.invalidateQueries({ queryKey: ["my-applications", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function next() {
    if (step === 0 && !form.course_id) {
      toast.error("Choose a programme to continue.");
      return;
    }
    if (step === 1 && (!form.full_name || !form.email || !form.phone)) {
      toast.error("Name, email and phone are required.");
      return;
    }
    await save.mutateAsync({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitApplication() {
    if (!form.course_id) {
      toast.error("Choose a programme first.");
      return;
    }
    if ((documents ?? []).length === 0) {
      toast.error("Upload at least one supporting document.");
      return;
    }
    await save.mutateAsync({ status: "submitted" });
    toast.success("Application submitted. We'll review it shortly.");
    navigate({ to: "/portal" });
  }

  const set = (key: keyof Draft) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (loading || !session) return null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      <span className="eyebrow text-primary">Admission portal</span>
      <h1 className="mt-2 text-4xl">Application form</h1>

      <ol className="mt-8 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                i === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : i < step
                    ? "border-accent/40 text-accent"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-3.5" /> : <span>{i + 1}</span>}
              {label}
            </button>
          </li>
        ))}
      </ol>

      <Card className="mt-6 shadow-card">
        <CardContent className="space-y-5 pt-6">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Programme of interest</Label>
                <Select
                  value={form.course_id ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, course_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {(courses ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCourse && (
                <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
                  <p className="text-muted-foreground">{selectedCourse.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-wide">
                    <span>Duration: {selectedCourse.duration}</span>
                    <span>Application fee: {naira(selectedCourse.application_fee)}</span>
                    <span>Tuition: {naira(selectedCourse.tuition_fee)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.full_name} onChange={set("full_name")} required />
              <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
              <Field label="Phone" value={form.phone} onChange={set("phone")} required />
              <Field
                label="Date of birth"
                type="date"
                value={form.date_of_birth}
                onChange={set("date_of_birth")}
              />
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={set("gender")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Nationality" value={form.nationality} onChange={set("nationality")} />
              <Field
                label="State of origin"
                value={form.state_of_origin}
                onChange={set("state_of_origin")}
              />
              <div className="sm:col-span-2">
                <Label htmlFor="address">Residential address</Label>
                <Textarea
                  id="address"
                  className="mt-2"
                  value={form.address}
                  maxLength={400}
                  onChange={(e) => set("address")(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Highest qualification"
                value={form.highest_qualification}
                onChange={set("highest_qualification")}
              />
              <Field
                label="Institution attended"
                value={form.institution_attended}
                onChange={set("institution_attended")}
              />
              <Field
                label="Year completed"
                value={form.year_completed}
                onChange={set("year_completed")}
              />
              <Field label="Guardian name" value={form.guardian_name} onChange={set("guardian_name")} />
              <Field
                label="Guardian phone"
                value={form.guardian_phone}
                onChange={set("guardian_phone")}
              />
              <div className="sm:col-span-2">
                <Label htmlFor="statement">Personal statement</Label>
                <Textarea
                  id="statement"
                  className="mt-2 min-h-32"
                  maxLength={2000}
                  placeholder="Tell us why you want to train with Pathway Pro."
                  value={form.personal_statement}
                  onChange={(e) => set("personal_statement")(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <DocumentsStep
              applicationId={applicationId}
              userId={userId!}
              documents={documents ?? []}
              onChanged={() =>
                qc.invalidateQueries({ queryKey: ["application-documents", applicationId] })
              }
            />
          )}

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <Row label="Programme" value={selectedCourse?.title ?? "—"} />
              <Row label="Applicant" value={form.full_name} />
              <Row label="Email" value={form.email} />
              <Row label="Phone" value={form.phone} />
              <Row label="Qualification" value={form.highest_qualification || "—"} />
              <Row label="Documents uploaded" value={String((documents ?? []).length)} />
              {selectedCourse && (
                <Row label="Application fee" value={naira(selectedCourse.application_fee)} />
              )}
              <p className="rounded-md border border-border bg-muted/40 p-4 text-muted-foreground">
                After submitting, pay your application fee from the portal to move your application
                into review. You can still be asked for extra documents.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <Button variant="ghost" asChild>
              <Link to="/portal">Save & exit</Link>
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button onClick={next} disabled={save.isPending}>
                  {save.isPending && <Loader2 className="size-4 animate-spin" />} Continue
                </Button>
              ) : (
                <Button onClick={submitApplication} disabled={save.isPending}>
                  {save.isPending && <Loader2 className="size-4 animate-spin" />} Submit application
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={150}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DocumentsStep({
  applicationId,
  userId,
  documents,
  onChanged,
}: {
  applicationId: string | null;
  userId: string;
  documents: { id: string; doc_type: string; file_name: string; file_path: string }[];
  onChanged: () => void;
}) {
  const [docType, setDocType] = useState<string>(DOC_TYPES[0].value);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!applicationId) {
      toast.error("Complete the earlier steps first.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Files must be 5MB or smaller.");
      return;
    }
    setBusy(true);
    const path = `${userId}/${applicationId}/${docType}-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage
      .from("application-documents")
      .upload(path, file);
    if (upErr) {
      setBusy(false);
      toast.error(upErr.message);
      return;
    }
    const { error } = await supabase.from("application_documents").insert({
      application_id: applicationId,
      user_id: userId,
      doc_type: docType,
      file_path: path,
      file_name: file.name,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Document uploaded.");
    onChanged();
  }

  async function remove(doc: { id: string; file_path: string }) {
    await supabase.storage.from("application-documents").remove([doc.file_path]);
    const { error } = await supabase.from("application_documents").delete().eq("id", doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    onChanged();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Document type</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">Choose file (PDF or image, max 5MB)</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,image/*"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="rounded-md border border-border">
        {documents.length === 0 ? (
          <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <Upload className="size-4" /> No documents uploaded yet.
          </p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 p-3">
                <span className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{d.file_name}</span>
                  <Badge variant="secondary">{d.doc_type.replace(/_/g, " ")}</Badge>
                </span>
                <Button size="sm" variant="ghost" onClick={() => remove(d)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
