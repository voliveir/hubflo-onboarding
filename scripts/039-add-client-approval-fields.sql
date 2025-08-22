-- Add fields for client approval notifications and feedback
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS white_label_approval_requested_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS white_label_approval_notification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS white_label_approval_feedback TEXT,
ADD COLUMN IF NOT EXISTS white_label_approval_feedback_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS white_label_implementation_manager_notified_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN clients.white_label_approval_requested_at IS 'When the status was changed to client_approval (for Zapier trigger)';
COMMENT ON COLUMN clients.white_label_approval_notification_sent_at IS 'When email notification was sent to client';
COMMENT ON COLUMN clients.white_label_approval_feedback IS 'Client feedback when requesting changes';
COMMENT ON COLUMN clients.white_label_approval_feedback_at IS 'When client provided feedback';
COMMENT ON COLUMN clients.white_label_implementation_manager_notified_at IS 'When implementation manager was notified of approval';
