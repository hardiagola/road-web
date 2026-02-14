
-- Add workflow columns to worker_assignments
ALTER TABLE public.worker_assignments 
  ADD COLUMN IF NOT EXISTS is_accepted boolean DEFAULT null,
  ADD COLUMN IF NOT EXISTS rejected_reason text,
  ADD COLUMN IF NOT EXISTS pay_change_requested numeric,
  ADD COLUMN IF NOT EXISTS time_change_requested numeric,
  ADD COLUMN IF NOT EXISTS change_request_note text,
  ADD COLUMN IF NOT EXISTS change_request_status text DEFAULT null,
  ADD COLUMN IF NOT EXISTS materials_submitted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS materials_approved boolean DEFAULT false;

-- Create work_materials table
CREATE TABLE public.work_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.worker_assignments(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.work_materials ENABLE ROW LEVEL SECURITY;

-- Workers can manage materials on their own assignments
CREATE POLICY "Workers manage own materials" ON public.work_materials
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM worker_assignments wa
    JOIN workers w ON wa.worker_id = w.id
    WHERE wa.id = work_materials.assignment_id AND w.user_id = auth.uid()
  )
);

-- Admin manages all materials
CREATE POLICY "Admin manages all materials" ON public.work_materials
FOR ALL USING (is_admin(auth.uid()));

-- Update status steps: add new statuses
-- Reported → Assigned → Accepted → Materials Submitted → Materials Approved → In Progress → Completed
