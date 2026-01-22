-- Add customer contact information and date availability to projects table

ALTER TABLE projects
ADD COLUMN customer_email TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN date_availability TEXT;

-- Add comment for documentation
COMMENT ON COLUMN projects.customer_email IS 'Customer email address';
COMMENT ON COLUMN projects.customer_phone IS 'Customer phone number';
COMMENT ON COLUMN projects.date_availability IS 'Customer preferred date/time availability';
