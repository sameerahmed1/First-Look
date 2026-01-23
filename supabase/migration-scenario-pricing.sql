-- Migration: Add Scenario-Based Pricing Support
-- Date: 2026-01-23
-- Description: Adds new columns to support scenario-based pricing with trade categories

-- Add new columns to project_analysis table
ALTER TABLE project_analysis
ADD COLUMN IF NOT EXISTS trade_category TEXT,
ADD COLUMN IF NOT EXISTS scenarios JSONB,
ADD COLUMN IF NOT EXISTS variables JSONB;

-- Add comment to document the schema
COMMENT ON COLUMN project_analysis.trade_category IS 'Primary trade category (e.g., Plumbing, Electrical, Roofing)';
COMMENT ON COLUMN project_analysis.scenarios IS 'Array of 3 pricing scenarios: Best Case, Most Likely, Worst Case';
COMMENT ON COLUMN project_analysis.variables IS 'Array of factors that drive cost variations';

-- Create index on trade_category for faster filtering
CREATE INDEX IF NOT EXISTS idx_project_analysis_trade_category ON project_analysis(trade_category);

-- Example scenario structure:
-- [
--   {"label": "Best Case", "price": "$1,200 - $1,500", "description": "..."},
--   {"label": "Most Likely", "price": "$1,800 - $2,400", "description": "..."},
--   {"label": "Worst Case", "price": "$3,000 - $4,500", "description": "..."}
-- ]

-- Example variables structure:
-- ["Access difficulty", "Material quality", "Hidden damage risk", "Permit requirements"]
