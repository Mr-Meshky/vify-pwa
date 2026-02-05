-- Config submissions table
CREATE TABLE IF NOT EXISTS public.config_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL CHECK (config_type IN ('VLESS', 'VMESS', 'Trojan', 'Shadowsocks', 'SOCKS', 'HTTP Proxy')),
  config_content TEXT NOT NULL,
  country TEXT NOT NULL,
  network_type TEXT NOT NULL CHECK (network_type IN ('mobile_data', 'home_wifi', 'public_wifi', 'isp_based', 'custom')),
  use_case TEXT NOT NULL CHECK (use_case IN ('browsing', 'gaming', 'download', 'telegram')),
  contributor_name TEXT,
  contributor_telegram TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  ip_hash TEXT,
  is_duplicate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Contributors table for tracking scores
CREATE TABLE IF NOT EXISTS public.contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  telegram TEXT,
  ip_hash TEXT UNIQUE,
  score INTEGER DEFAULT 0,
  level TEXT DEFAULT 'new' CHECK (level IN ('new', 'contributor', 'trusted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.config_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

-- Public can insert submissions (no auth required)
CREATE POLICY "anyone_can_submit" ON public.config_submissions
  FOR INSERT WITH CHECK (true);

-- Public can read approved submissions only
CREATE POLICY "anyone_can_read_approved" ON public.config_submissions
  FOR SELECT USING (status = 'approved');

-- Admins can do everything on submissions
CREATE POLICY "admins_full_access_submissions" ON public.config_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Public can read contributor stats
CREATE POLICY "anyone_can_read_contributors" ON public.contributors
  FOR SELECT USING (true);

-- Allow insert on contributors for server actions (service role handles this via anon + trigger)
CREATE POLICY "anyone_can_insert_contributors" ON public.contributors
  FOR INSERT WITH CHECK (true);

-- Allow update on contributors for score changes
CREATE POLICY "admins_update_contributors" ON public.contributors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Function to auto-update contributor score on approval
CREATE OR REPLACE FUNCTION public.update_contributor_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip_hash TEXT;
  v_new_score INTEGER;
BEGIN
  -- Only act when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    v_ip_hash := NEW.ip_hash;
    
    -- Upsert contributor
    INSERT INTO public.contributors (ip_hash, name, telegram, score)
    VALUES (v_ip_hash, NEW.contributor_name, NEW.contributor_telegram, 1)
    ON CONFLICT (ip_hash) DO UPDATE
    SET score = contributors.score + 1,
        name = COALESCE(NEW.contributor_name, contributors.name),
        telegram = COALESCE(NEW.contributor_telegram, contributors.telegram),
        updated_at = now();
    
    -- Update level based on new score
    SELECT score INTO v_new_score FROM public.contributors WHERE ip_hash = v_ip_hash;
    
    UPDATE public.contributors
    SET level = CASE
      WHEN v_new_score >= 10 THEN 'trusted'
      WHEN v_new_score >= 3 THEN 'contributor'
      ELSE 'new'
    END
    WHERE ip_hash = v_ip_hash;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for auto-updating contributor score
DROP TRIGGER IF EXISTS on_submission_approved ON public.config_submissions;
CREATE TRIGGER on_submission_approved
  AFTER UPDATE ON public.config_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contributor_score();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.config_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_ip_hash ON public.config_submissions(ip_hash);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.config_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributors_score ON public.contributors(score DESC);
