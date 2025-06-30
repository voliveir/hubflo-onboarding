-- 026-create-workflow-templates.sql
-- Migration: Create workflow_templates table for admin-controlled workflow templates

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_json JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  is_global BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookup of global templates
CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_global ON workflow_templates(is_global); 