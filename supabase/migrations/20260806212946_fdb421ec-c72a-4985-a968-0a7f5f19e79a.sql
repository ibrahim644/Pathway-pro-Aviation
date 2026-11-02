CREATE TABLE public.trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT 'Browser',
  last_used_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, DELETE ON public.trusted_devices TO authenticated;
GRANT ALL ON public.trusted_devices TO service_role;

ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY trusted_devices_select_own ON public.trusted_devices
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY trusted_devices_delete_own ON public.trusted_devices
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX trusted_devices_user_idx ON public.trusted_devices (user_id);