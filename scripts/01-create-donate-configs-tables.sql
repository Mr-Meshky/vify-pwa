-- Create table for config submissions
CREATE TABLE IF NOT EXISTS config_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type VARCHAR(50) NOT NULL,
  config_content TEXT NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),
  network_compatibility TEXT[] DEFAULT '{}',
  use_case VARCHAR(50),
  contributor_nickname VARCHAR(100),
  contributor_telegram VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_ip VARCHAR(50),
  is_duplicate BOOLEAN DEFAULT FALSE,
  quality_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  published_at TIMESTAMPTZ
);

-- Create table for contributors tracking
CREATE TABLE IF NOT EXISTS contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(100),
  telegram_username VARCHAR(100),
  total_submissions INTEGER DEFAULT 0,
  approved_submissions INTEGER DEFAULT 0,
  rejected_submissions INTEGER DEFAULT 0,
  contributor_score INTEGER DEFAULT 0,
  contributor_level VARCHAR(20) DEFAULT 'New' CHECK (contributor_level IN ('New', 'Contributor', 'Trusted', 'Elite')),
  first_submission_at TIMESTAMPTZ DEFAULT NOW(),
  last_submission_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_username)
);

-- Create table for IP-based rate limiting
CREATE TABLE IF NOT EXISTS submission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(50) NOT NULL,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_config_submissions_status ON config_submissions(status);
CREATE INDEX IF NOT EXISTS idx_config_submissions_created_at ON config_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_submissions_contributor ON config_submissions(contributor_telegram);
CREATE INDEX IF NOT EXISTS idx_contributors_telegram ON contributors(telegram_username);
CREATE INDEX IF NOT EXISTS idx_contributors_score ON contributors(contributor_score DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON submission_rate_limits(ip_address);

-- Create function to update contributor stats
CREATE OR REPLACE FUNCTION update_contributor_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Update or insert contributor record
    INSERT INTO contributors (
      telegram_username,
      nickname,
      total_submissions,
      approved_submissions,
      contributor_score,
      last_submission_at
    )
    VALUES (
      NEW.contributor_telegram,
      NEW.contributor_nickname,
      1,
      1,
      10,
      NOW()
    )
    ON CONFLICT (telegram_username)
    DO UPDATE SET
      approved_submissions = contributors.approved_submissions + 1,
      contributor_score = contributors.contributor_score + 10,
      last_submission_at = NOW(),
      contributor_level = CASE
        WHEN contributors.contributor_score + 10 >= 100 THEN 'Elite'
        WHEN contributors.contributor_score + 10 >= 50 THEN 'Trusted'
        WHEN contributors.contributor_score + 10 >= 10 THEN 'Contributor'
        ELSE 'New'
      END;
  ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    -- Update rejection count
    INSERT INTO contributors (
      telegram_username,
      nickname,
      total_submissions,
      rejected_submissions,
      last_submission_at
    )
    VALUES (
      NEW.contributor_telegram,
      NEW.contributor_nickname,
      1,
      1,
      NOW()
    )
    ON CONFLICT (telegram_username)
    DO UPDATE SET
      rejected_submissions = contributors.rejected_submissions + 1,
      last_submission_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating contributor stats
DROP TRIGGER IF EXISTS trigger_update_contributor_stats ON config_submissions;
CREATE TRIGGER trigger_update_contributor_stats
  AFTER UPDATE OF status ON config_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contributor_stats();

-- Enable Row Level Security (RLS)
ALTER TABLE config_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved submissions
CREATE POLICY "Public can view approved submissions"
  ON config_submissions
  FOR SELECT
  USING (status = 'approved');

-- Allow public insert for new submissions
CREATE POLICY "Anyone can submit configs"
  ON config_submissions
  FOR INSERT
  WITH CHECK (true);

-- Allow public read access to contributor leaderboard
CREATE POLICY "Public can view contributors"
  ON contributors
  FOR SELECT
  USING (true);

-- Admin policies (you'll need to create admin roles separately)
-- For now, we'll allow all operations for testing
CREATE POLICY "Allow all for service role"
  ON config_submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for service role on contributors"
  ON contributors
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for service role on rate limits"
  ON submission_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);
