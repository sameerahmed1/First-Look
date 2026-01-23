-- Migration: Restore Dashboard Elements
-- Date: 2026-01-23
-- Description: Adds white labeling support, capture data, AI analysis structure, and updated status enum

-- ============================================================================
-- PHASE 1: CONTRACTORS TABLE - Add White Labeling Support
-- ============================================================================

-- Add logo_url column to contractors table for white labeling
ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN contractors.logo_url IS 'URL to contractor logo for white labeling on customer-facing pages';

-- ============================================================================
-- PHASE 2: PROJECTS TABLE - Add Capture Data & AI Analysis
-- ============================================================================

-- Add capture_data column to store structured homeowner answers from the Guided Capture Wizard
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS capture_data JSONB;

COMMENT ON COLUMN projects.capture_data IS 'Structured homeowner input from Guided Capture Wizard: problem type, safety checks, home info, context';

-- Add ai_analysis column to store structured AI output for Strategic Job Brief
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS ai_analysis JSONB;

COMMENT ON COLUMN projects.ai_analysis IS 'Structured AI analysis: summary, missing_evidence, triage (urgency/trade/risk_flags), scope_hypotheses, price_breakdown';

-- Add customer_phone and customer_email for direct communication
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

COMMENT ON COLUMN projects.customer_phone IS 'Customer contact phone number';
COMMENT ON COLUMN projects.customer_email IS 'Customer contact email';

-- ============================================================================
-- PHASE 3: UPDATE STATUS ENUM - Support New Workflow States
-- ============================================================================

-- Drop the existing CHECK constraint on status
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add the new CHECK constraint with expanded status options
ALTER TABLE projects
ADD CONSTRAINT projects_status_check
CHECK (status IN ('new', 'pending', 'analyzed', 'reviewed', 'quoted', 'completed', 'archived'));

-- Set default status to 'new' for incoming projects from the Guided Capture Wizard
ALTER TABLE projects
ALTER COLUMN status SET DEFAULT 'new';

COMMENT ON COLUMN projects.status IS 'Project status: new (just submitted), pending (processing), analyzed (AI complete), reviewed (contractor viewed), quoted (estimate sent), completed (job done), archived (closed)';

-- ============================================================================
-- PHASE 4: ADD INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Add GIN index for JSONB columns to enable efficient querying
CREATE INDEX IF NOT EXISTS idx_projects_capture_data ON projects USING GIN (capture_data);
CREATE INDEX IF NOT EXISTS idx_projects_ai_analysis ON projects USING GIN (ai_analysis);

-- Add index for customer contact info lookups
CREATE INDEX IF NOT EXISTS idx_projects_customer_email ON projects(customer_email) WHERE customer_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_customer_phone ON projects(customer_phone) WHERE customer_phone IS NOT NULL;
