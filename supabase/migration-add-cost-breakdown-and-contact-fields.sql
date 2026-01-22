-- Migration: Add cost breakdown and customer contact fields
-- This enhances the AI analysis with detailed cost variables and contractor notes
-- Also adds customer phone and availability for better communication
-- Run this in your Supabase SQL Editor

-- Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_availability TEXT;

COMMENT ON COLUMN projects.customer_phone IS 'Customer phone number for contact';
COMMENT ON COLUMN projects.customer_availability IS 'JSON array of available dates';

-- Add new columns to project_analysis table
ALTER TABLE project_analysis
ADD COLUMN IF NOT EXISTS cost_variables TEXT[],
ADD COLUMN IF NOT EXISTS contractor_note TEXT;

COMMENT ON COLUMN project_analysis.cost_variables IS 'Array of cost driver strings (e.g., Mold presence, Drywall vs Plaster)';
COMMENT ON COLUMN project_analysis.contractor_note IS 'Private note for contractor with inspection points';
