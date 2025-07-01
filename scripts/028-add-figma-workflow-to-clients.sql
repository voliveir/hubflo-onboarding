-- Migration: Add Figma workflow fields to clients table
ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS show_figma_workflow BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS figma_workflow_url TEXT; 