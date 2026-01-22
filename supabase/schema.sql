-- First Look Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contractors table (linked to Supabase Auth users)
CREATE TABLE contractors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upload links table (for personalized customer upload URLs)
CREATE TABLE upload_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  label TEXT, -- Optional label like "John's Kitchen Repair"
  expires_at TIMESTAMPTZ, -- NULL means never expires
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  upload_link_id UUID REFERENCES upload_links(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  date_availability TEXT,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'quoted', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project media table (stores uploaded files)
CREATE TABLE project_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project analysis table (stores AI analysis results)
CREATE TABLE project_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  damage_type TEXT NOT NULL,
  severity_score INTEGER NOT NULL CHECK (severity_score >= 0 AND severity_score <= 10),
  cost_estimate_min INTEGER NOT NULL DEFAULT 0,
  cost_estimate_max INTEGER NOT NULL DEFAULT 0,
  cost_reasoning TEXT,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_media_project_id ON project_media(project_id);
CREATE INDEX idx_upload_links_token ON upload_links(token);
CREATE INDEX idx_upload_links_contractor_id ON upload_links(contractor_id);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analysis ENABLE ROW LEVEL SECURITY;

-- Contractors: users can only see/edit their own record
CREATE POLICY "Contractors can view own record" ON contractors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Contractors can update own record" ON contractors
  FOR UPDATE USING (auth.uid() = id);

-- Upload links: contractors can manage their own links
CREATE POLICY "Contractors can view own upload links" ON upload_links
  FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can create upload links" ON upload_links
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete own upload links" ON upload_links
  FOR DELETE USING (auth.uid() = contractor_id);

-- Allow anonymous users to read upload links by token (for customer uploads)
CREATE POLICY "Anyone can view upload link by token" ON upload_links
  FOR SELECT USING (true);

-- Projects: contractors can manage their own projects
CREATE POLICY "Contractors can view own projects" ON projects
  FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = contractor_id);

-- Allow anonymous insert for customer uploads (via upload link)
CREATE POLICY "Anyone can create projects" ON projects
  FOR INSERT WITH CHECK (true);

-- Project media: contractors can view their project media
CREATE POLICY "Contractors can view own project media" ON project_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_media.project_id
      AND projects.contractor_id = auth.uid()
    )
  );

-- Allow anonymous insert for customer uploads
CREATE POLICY "Anyone can add project media" ON project_media
  FOR INSERT WITH CHECK (true);

-- Project analysis: contractors can view their project analysis
CREATE POLICY "Contractors can view own project analysis" ON project_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_analysis.project_id
      AND projects.contractor_id = auth.uid()
    )
  );

-- Allow insert for analysis (server-side with service role)
CREATE POLICY "Anyone can add project analysis" ON project_analysis
  FOR INSERT WITH CHECK (true);

-- Function to automatically create contractor record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.contractors (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
