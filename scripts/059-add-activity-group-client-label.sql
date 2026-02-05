-- Optional free-text client label for groups not tied to a client in the list
-- e.g. "Capital Q" for long-standing clients not yet in Hubflo

ALTER TABLE activity_groups
ADD COLUMN IF NOT EXISTS client_label VARCHAR(255);

COMMENT ON COLUMN activity_groups.client_label IS 'Free-text client/project name when client_id is null (work not linked to a client in the list)';
