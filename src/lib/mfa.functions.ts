import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_COUNT = 10;

function formatCode(raw: string) {
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

function newCode() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return formatCode(out);
}

async function hashCode(code: string) {
  const normalised = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`ppat-mfa-recovery:${normalised}`),
  );
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function assertStaff(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "staff"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Recovery codes are only available to admin staff.");
}

/** How many unused recovery codes the signed-in staff member has left. */
export const getRecoveryCodeStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { count, error } = await context.supabase
      .from("mfa_recovery_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .is("used_at", null);
    if (error) throw new Error(error.message);
    return { remaining: count ?? 0 };
  });

/** Issues a fresh set of one-time codes, invalidating any previous ones. */
export const generateRecoveryCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const aal = (context.claims as { aal?: string } | null)?.aal;
    if (aal !== "aal2") {
      throw new Error("Complete two-factor verification before generating recovery codes.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const codes = Array.from({ length: CODE_COUNT }, newCode);
    const rows = await Promise.all(
      codes.map(async (code) => ({
        user_id: context.userId,
        code_hash: await hashCode(code),
      })),
    );

    await supabaseAdmin.from("mfa_recovery_codes").delete().eq("user_id", context.userId);
    const { error } = await supabaseAdmin.from("mfa_recovery_codes").insert(rows);
    if (error) throw new Error(error.message);

    return { codes };
  });

/**
 * Spends a one-time recovery code for a signed-in (aal1) staff member who lost
 * their authenticator: the code is burned and every TOTP factor is removed so
 * the gate walks them through fresh enrolment.
 */
export const redeemRecoveryCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ code: z.string().min(6).max(32) }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const hash = await hashCode(data.code);

    const { data: spent, error } = await supabaseAdmin
      .from("mfa_recovery_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("code_hash", hash)
      .is("used_at", null)
      .select("id");
    if (error) throw new Error(error.message);
    if (!spent?.length) throw new Error("That recovery code is invalid or already used.");

    // Losing an authenticator invalidates every remembered browser too.
    await supabaseAdmin.from("trusted_devices").delete().eq("user_id", context.userId);

    const { data: factors, error: listError } = await supabaseAdmin.auth.admin.mfa.listFactors({

      userId: context.userId,
    });
    if (listError) throw new Error(listError.message);
    for (const factor of factors?.factors ?? []) {
      await supabaseAdmin.auth.admin.mfa.deleteFactor({
        id: factor.id,
        userId: context.userId,
      });
    }

    const { count } = await supabaseAdmin
      .from("mfa_recovery_codes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .is("used_at", null);

    return { remaining: count ?? 0 };
  });

/* ------------------------------------------------------------------ */
/* Trusted devices ("remember this device")                            */
/* ------------------------------------------------------------------ */

const TRUST_DAYS = 30;

async function hashDeviceToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`ppat-mfa-device:${token}`),
  );
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const tokenSchema = z.object({ token: z.string().min(32).max(200) });

/**
 * Marks the current browser as trusted for TRUST_DAYS. Only callable once the
 * session has actually cleared TOTP (aal2), so a stolen session can't self-trust.
 */
export const trustCurrentDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => tokenSchema.extend({ label: z.string().max(80).optional() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    if ((context.claims as { aal?: string } | null)?.aal !== "aal2") {
      throw new Error("Complete two-factor verification before trusting this device.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const expires = new Date(Date.now() + TRUST_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabaseAdmin.from("trusted_devices").upsert(
      {
        user_id: context.userId,
        token_hash: await hashDeviceToken(data.token),
        label: data.label?.slice(0, 80) || "Browser",
        expires_at: expires,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "token_hash" },
    );
    if (error) throw new Error(error.message);
    return { expiresAt: expires };
  });

/** Checks a device token for the signed-in staff member; refreshes last-used on hit. */
export const checkTrustedDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => tokenSchema.parse(data))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const hash = await hashDeviceToken(data.token);

    const { data: rows, error } = await supabaseAdmin
      .from("trusted_devices")
      .update({ last_used_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .eq("token_hash", hash)
      .gt("expires_at", new Date().toISOString())
      .select("expires_at");
    if (error) throw new Error(error.message);

    return { trusted: !!rows?.length, expiresAt: rows?.[0]?.expires_at ?? null };
  });

/** Drops every remembered browser for this staff member. */
export const forgetTrustedDevices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("trusted_devices")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

