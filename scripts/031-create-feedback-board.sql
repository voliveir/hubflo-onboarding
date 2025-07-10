-- Create feedback_board_cards table for client-submitted bugs, feature requests, and improvements
CREATE TABLE IF NOT EXISTS feedback_board_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature', 'improvement')),
    status VARCHAR(20) NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'completed', 'closed')),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- nullable, for admin tracking if needed
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_board_cards_client_id ON feedback_board_cards(client_id);
CREATE INDEX IF NOT EXISTS idx_feedback_board_cards_status ON feedback_board_cards(status);
CREATE INDEX IF NOT EXISTS idx_feedback_board_cards_type ON feedback_board_cards(type); 

-- Add extra_call_dates column to clients table for tracking additional call dates
ALTER TABLE clients ADD COLUMN IF NOT EXISTS extra_call_dates text[]; 