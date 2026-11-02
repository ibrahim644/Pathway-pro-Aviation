import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, KeyRound, LifeBuoy, Copy, MonitorCheck } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import {
  checkTrustedDevice,
  forgetTrustedDevices,
  generateRecoveryCodes,
  getRecoveryCodeStatus,
  redeemRecoveryCode,
  trustCurrentDevice,
} from "@/lib/mfa.functions";
import {
  clearDeviceToken,
  createDeviceToken,
  deviceLabel,
  readDeviceToken,
} from "@/lib/device-trust";

type Phase = "checking" | "enroll" | "challenge" | "ready";

/**
 * Requires a verified TOTP factor (AAL2) before rendering admin content.
 * Staff without a factor are walked through enrolment first. Browsers the
 * user explicitly trusted skip the prompt until the trust expires.
 */
export function AdminMfaGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [remember, setRemember] = useState(false);
  const [trustedSkip, setTrustedSkip] = useState(false);

  const redeem = useServerFn(redeemRecoveryCode);
  const generate = useServerFn(generateRecoveryCodes);
  const status = useServerFn(getRecoveryCodeStatus);
  const trustDevice = useServerFn(trustCurrentDevice);
  const checkDevice = useServerFn(checkTrustedDevice);
  const forgetDevices = useServerFn(forgetTrustedDevices);


  const refresh = useCallback(async () => {
    setPhase("checking");
    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) {
      toast.error(aalError.message);
      return;
    }
    if (aal?.currentLevel === "aal2") {
      setPhase("ready");
      return;
    }

    const { data: factors, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error(error.message);
      return;
    }
    const verified = factors?.totp?.find((f) => f.status === "verified");
    if (verified) {
      // A remembered browser skips the prompt; the token is only meaningful
      // alongside this signed-in staff session and expires server-side.
      const token = readDeviceToken();
      if (token) {
        try {
          const { trusted } = await checkDevice({ data: { token } });
          if (trusted) {
            setTrustedSkip(true);
            setPhase("ready");
            return;
          }
          clearDeviceToken();
        } catch {
          // Fall through to the normal prompt.
        }
      }
      setFactorId(verified.id);
      setCode("");
      setPhase("challenge");
      return;
    }


    // Clean up any half-finished enrolments so a fresh QR can be issued.
    for (const f of factors?.all ?? []) {
      if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Admin TOTP ${new Date().toISOString().slice(0, 10)}`,
    });
    if (enrollError || !enrolled) {
      toast.error(enrollError?.message ?? "Could not start two-factor setup.");
      return;
    }
    setFactorId(enrolled.id);
    setQr(enrolled.totp.qr_code);
    setSecret(enrolled.totp.secret);
    setCode("");
    setPhase("enroll");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError || !challenge) {
      setBusy(false);
      toast.error(challengeError?.message ?? "Could not start verification.");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ""),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Two-factor verification complete.");
    if (remember) {
      try {
        await trustDevice({ data: { token: createDeviceToken(), label: deviceLabel() } });
        setTrustedSkip(true);
        toast.success("This browser will be remembered for 30 days.");
      } catch {
        clearDeviceToken();
        toast.error("Could not remember this device — you'll be asked again next time.");
      }
    }

    try {
      const { remaining: left } = await status({});
      setRemaining(left);
      if (left === 0) {
        const { codes } = await generate({});
        setFreshCodes(codes);
        setRemaining(codes.length);
        return;
      }
    } catch {
      // Recovery codes are a convenience; never block dashboard access on them.
    }
    setPhase("ready");
  }

  async function useRecoveryCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await redeem({ data: { code: recoveryCode } });
      toast.success("Recovery code accepted. Set up a new authenticator.");
      setRecoveryCode("");
      setRecoveryMode(false);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not use that recovery code.");
    } finally {
      setBusy(false);
    }
  }

  if (freshCodes) {
    return (
      <section className="mx-auto max-w-lg px-6 py-20">
        <Card className="shadow-lift">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center gap-3">
              <LifeBuoy className="size-6 text-primary" />
              <h1 className="text-2xl">Save your recovery codes</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Each code works once if you lose your authenticator. Store them somewhere safe — they
              will not be shown again.
            </p>
            <ul className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm">
              {freshCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  void navigator.clipboard.writeText(freshCodes.join("\n"));
                  toast.success("Recovery codes copied.");
                }}
              >
                <Copy className="size-4" /> Copy codes
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setFreshCodes(null);
                  setPhase("ready");
                }}
              >
                I have saved them
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (phase === "ready")
    return (
      <>
        {trustedSkip && (
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 pt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MonitorCheck className="size-4 text-primary" />
              This browser is remembered, so two-factor won't be requested for 30 days.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await forgetDevices({});
                  clearDeviceToken();
                  setTrustedSkip(false);
                  toast.success("Remembered browsers cleared.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not clear devices.");
                }
              }}
            >
              Forget trusted devices
            </Button>
          </div>
        )}
        {children}
      </>
    );


  if (phase === "checking")
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (recoveryMode)
    return (
      <section className="mx-auto max-w-lg px-6 py-20">
        <Card className="shadow-lift">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center gap-3">
              <LifeBuoy className="size-6 text-primary" />
              <h1 className="text-2xl">Use a recovery code</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter one of the one-time codes you saved when two-factor was set up. It will be used
              up, and you will be asked to register a new authenticator.
            </p>
            <form className="space-y-4" onSubmit={useRecoveryCode}>
              <div className="space-y-2">
                <Label htmlFor="recovery-code">Recovery code</Label>
                <Input
                  id="recovery-code"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  autoComplete="one-time-code"
                  placeholder="ABCDE-FGHJK"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy || recoveryCode.length < 6}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Use code
              </Button>
            </form>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setRecoveryMode(false)}
            >
              Back to authenticator
            </Button>
          </CardContent>
        </Card>
      </section>
    );

  return (
    <section className="mx-auto max-w-lg px-6 py-20">
      <Card className="shadow-lift">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center gap-3">
            {phase === "enroll" ? (
              <ShieldCheck className="size-6 text-primary" />
            ) : (
              <KeyRound className="size-6 text-primary" />
            )}
            <h1 className="text-2xl">
              {phase === "enroll" ? "Set up two-factor authentication" : "Two-factor verification"}
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            {phase === "enroll"
              ? "The admissions dashboard requires an authenticator app. Scan the code below with Google Authenticator, Authy or 1Password, then enter the 6-digit code to finish."
              : "Enter the current 6-digit code from your authenticator app to open the admissions dashboard."}
          </p>

          {phase === "enroll" && qr && (
            <div className="space-y-3">
              <img
                src={qr}
                alt="QR code for two-factor authenticator enrolment"
                className="mx-auto size-48 rounded-lg border border-border bg-card p-2"
              />
              {secret && (
                <p className="break-all text-center text-xs text-muted-foreground">
                  Can't scan? Enter this key manually: <strong>{secret}</strong>
                </p>
              )}
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Authentication code</Label>
              <Input
                id="mfa-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="123456"
              />
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Checkbox
                id="remember-device"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="remember-device" className="text-sm font-normal leading-snug">
                Remember this device for 30 days
                <span className="block text-xs text-muted-foreground">
                  Only do this on a private browser you control. Sign-in is still required, and
                  using a recovery code clears every remembered device.
                </span>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={busy || code.length < 6}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {phase === "enroll" ? "Verify and enable" : "Verify"}
            </Button>
          </form>

          {remaining !== null && remaining > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              {remaining} recovery code{remaining === 1 ? "" : "s"} remaining.
            </p>
          )}

          {phase === "challenge" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setRecoveryMode(true)}
            >
              <LifeBuoy className="size-4" /> Lost your authenticator? Use a recovery code
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.replace("/auth");
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
