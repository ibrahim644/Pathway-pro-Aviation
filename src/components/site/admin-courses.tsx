import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { naira, type Course } from "@/lib/content";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type CourseDraft = Omit<Course, "id"> & { id?: string };

const emptyCourse: CourseDraft = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  duration: "",
  tuition_fee: 0,
  application_fee: 0,
  requirements: [],
  image_url: null,
  is_active: true,
  sort_order: 0,
};

export function AdminCourses() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CourseDraft | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Course[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    qc.invalidateQueries({ queryKey: ["courses"] });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Programme deleted.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("courses").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg">Programmes</h3>
          <p className="text-sm text-muted-foreground">
            Create and edit courses, fees and admission requirements.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...emptyCourse, sort_order: (courses?.length ?? 0) + 1 })}>
          <Plus className="size-4" /> New programme
        </Button>
      </div>

      {isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground" />}

      {!isLoading && (courses ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">No programmes yet.</p>
      )}

      <div className="grid gap-4">
        {(courses ?? []).map((course) => (
          <Card key={course.id} className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg">{course.title}</h4>
                    <Badge variant={course.is_active ? "default" : "secondary"}>
                      {course.is_active ? "Published" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{course.summary}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-display">{naira(course.tuition_fee)}</span> tuition ·{" "}
                    <span className="font-display">{naira(course.application_fee)}</span> application
                    fee · {course.duration || "—"} · {course.requirements.length} requirement
                    {course.requirements.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={course.is_active}
                    aria-label="Published"
                    onCheckedChange={(v) =>
                      toggleActive.mutate({ id: course.id, is_active: v })
                    }
                  />
                  <Button size="sm" variant="outline" onClick={() => setEditing(course)}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {course.title}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes the programme from the website. Applications already linked
                          to it are kept.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove.mutate(course.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CourseEditor
        draft={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          refresh();
        }}
      />
    </div>
  );
}

function CourseEditor({
  draft,
  onClose,
  onSaved,
}: {
  draft: CourseDraft | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);

  if (!draft) return null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit programme" : "New programme"}</DialogTitle>
          <DialogDescription>
            Fees are in naira. Put each admission requirement on its own line.
          </DialogDescription>
        </DialogHeader>

        <form
          id="course-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const title = String(f.get("title")).trim();
            const payload = {
              title,
              slug: slugify(String(f.get("slug") || title)),
              summary: String(f.get("summary") ?? "").trim(),
              description: String(f.get("description") ?? "").trim(),
              duration: String(f.get("duration") ?? "").trim(),
              tuition_fee: Number(f.get("tuition_fee") ?? 0),
              application_fee: Number(f.get("application_fee") ?? 0),
              requirements: String(f.get("requirements") ?? "")
                .split("\n")
                .map((r) => r.trim())
                .filter(Boolean),
              image_url: String(f.get("image_url") ?? "").trim() || null,
              sort_order: Number(f.get("sort_order") ?? 0),
              is_active: f.get("is_active") === "on",
            };

            if (!payload.title || !payload.slug) {
              toast.error("Title is required.");
              return;
            }

            setBusy(true);
            const { error } = draft.id
              ? await supabase.from("courses").update(payload).eq("id", draft.id)
              : await supabase.from("courses").insert(payload);
            setBusy(false);

            if (error) {
              toast.error(error.message);
              return;
            }
            toast.success(draft.id ? "Programme updated." : "Programme created.");
            onSaved();
          }}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={draft.title} required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={draft.slug}
              placeholder="auto from title"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              name="duration"
              defaultValue={draft.duration}
              placeholder="18 months"
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tuition_fee">Tuition fee (₦)</Label>
            <Input
              id="tuition_fee"
              name="tuition_fee"
              type="number"
              min={0}
              step={1000}
              defaultValue={draft.tuition_fee}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="application_fee">Application fee (₦)</Label>
            <Input
              id="application_fee"
              name="application_fee"
              type="number"
              min={0}
              step={500}
              defaultValue={draft.application_fee}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="summary">Summary</Label>
            <Input id="summary" name="summary" defaultValue={draft.summary} maxLength={200} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={draft.description}
              maxLength={4000}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="requirements">Admission requirements (one per line)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              rows={5}
              defaultValue={draft.requirements.join("\n")}
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              defaultValue={draft.image_url ?? ""}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={draft.sort_order}
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch id="is_active" name="is_active" defaultChecked={draft.is_active} />
            <Label htmlFor="is_active">Published on the public website</Label>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="course-form" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}{" "}
            {draft.id ? "Save changes" : "Create programme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
