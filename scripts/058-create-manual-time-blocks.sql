-- Manual time blocks (e.g. lunch, break) with no browser activity

CREATE TABLE IF NOT EXISTS manual_time_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'lunch',
    label VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manual_time_blocks_started_at ON manual_time_blocks(started_at);
CREATE INDEX IF NOT EXISTS idx_manual_time_blocks_ended_at ON manual_time_blocks(ended_at);

-- RLS
ALTER TABLE manual_time_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "manual_time_blocks_allow_all" ON manual_time_blocks;
CREATE POLICY "manual_time_blocks_allow_all" ON manual_time_blocks
  FOR ALL USING (true) WITH CHECK (true);
