-- Add reporter information columns to reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS reporter_name TEXT,
ADD COLUMN IF NOT EXISTS reporter_phone TEXT,
ADD COLUMN IF NOT EXISTS reporter_email TEXT;

-- Add address validation for reports
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add location validation status
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS address_validated BOOLEAN DEFAULT FALSE;

-- Create index for address validation
CREATE INDEX IF NOT EXISTS idx_reports_address_validated ON public.reports(address_validated);
