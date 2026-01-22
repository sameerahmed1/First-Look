-- Migration: Add missing INSERT policy for contractors table
-- This fixes the RLS policy violation when creating upload links
-- Run this in your Supabase SQL Editor

-- Add INSERT policy to allow users to create their own contractor record
CREATE POLICY "Contractors can insert own record" ON contractors
  FOR INSERT WITH CHECK (auth.uid() = id);
