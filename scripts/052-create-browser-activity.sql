-- Create browser activity table for automatic time tracking (Memory Aid / Activity Timeline)
-- Populated by the Chrome extension when automatic browser tracking is enabled

CREATE TABLE IF NOT EXISTS browser_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    domain VARCHAR(500),
    page_title TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    source VARCHAR(50) DEFAULT 'chrome_extension',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying by date
CREATE INDEX IF NOT EXISTS idx_browser_activity_started_at ON browser_activity(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_browser_activity_client_id ON browser_activity(client_id);
CREATE INDEX IF NOT EXISTS idx_browser_activity_domain ON browser_activity(domain);
