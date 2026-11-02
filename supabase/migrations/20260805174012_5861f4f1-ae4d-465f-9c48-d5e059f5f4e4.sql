CREATE TABLE public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, code_hash)
);

GRANT SELECT ON public.mfa_recovery_codes TO authenticated;
GRANT ALL ON public.mfa_recovery_codes TO service_role;

ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recovery_codes_select_own"
ON public.mfa_recovery_codes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE INDEX mfa_recovery_codes_user_idx ON public.mfa_recovery_codes (user_id) WHERE used_at IS NULL;