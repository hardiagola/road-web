-- Create work_requests table
CREATE TABLE IF NOT EXISTS work_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  estimated_hours DECIMAL(5,2) NOT NULL,
  estimated_cost DECIMAL(10,2) NOT NULL,
  proposed_completion_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_work_requests_report_id ON work_requests(report_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_worker_id ON work_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_status ON work_requests(status);

-- Add reporter information columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS reporter_name TEXT,
ADD COLUMN IF NOT EXISTS reporter_phone TEXT,
ADD COLUMN IF NOT EXISTS reporter_email TEXT;

-- Enable RLS
ALTER TABLE work_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view work requests for their reports" ON work_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = work_requests.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can view their own work requests" ON work_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE workers.id = work_requests.worker_id 
      AND workers.user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can insert their own work requests" ON work_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE workers.id = work_requests.worker_id 
      AND workers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to work requests" ON work_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_requests_updated_at 
    BEFORE UPDATE ON work_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
