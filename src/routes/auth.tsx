import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHero } from "@/components/site/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next:
      typeof search['next'] === "string" && search['next'].startsWith("/")
        ? search['next']
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Applicant Sign In & Registration — Pathway Pro" },
      {
        name: "description",
        content:
          "Create an account or sign in to the Pathway Pro Aviation Training admission portal to apply, upload documents and track your application.",
      },
      { property: "og:title", content: "Applicant portal sign in — Pathway Pro" },
      { property: "og:description", content: "Sign in or register for the admission portal." },
      { property: "og:url", content: "/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;
    if (next) window.location.replace(next);
    else navigate({ to: "/portal", replace: true });
  }, [session, navigate, next]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back.");
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(f.get("email")),
      password: String(f.get("password")),
      options: {
        emailRedirectTo: window.location.origin + (next ?? "/portal"),
        data: { full_name: String(f.get("full_name")), phone: String(f.get("phone")) },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else if (!data.session)
      toast.success("Account created. Check your email to confirm your address.");
  }

  return (
    <>
      <PageHero
        eyebrow="Admission portal"
        title="Applicant sign in"
        subtitle="Create an account to start an application, or sign in to continue where you left off."
      />
      <section className="mx-auto max-w-md px-6 py-20">
        <Card className="shadow-lift">
          <CardContent className="pt-6">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="space-y-4 pt-4" onSubmit={signIn}>
                  <div className="space-y-2">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-password">Password</Label>
                    <Input id="si-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-4 pt-4" onSubmit={signUp}>
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" name="full_name" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-phone">Phone</Label>
                    <Input id="su-phone" name="phone" maxLength={30} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input id="su-password" name="password" type="password" required minLength={8} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to Pathway Pro's admission terms.{" "}
              <Link to="/contact" className="text-accent">
                Need help?
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
