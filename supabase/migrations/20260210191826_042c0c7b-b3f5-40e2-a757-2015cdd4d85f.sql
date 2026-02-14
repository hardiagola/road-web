
-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true);

-- Storage policies
CREATE POLICY "Anyone can view report images" ON storage.objects FOR SELECT USING (bucket_id = 'report-images');
CREATE POLICY "Authenticated users can upload report images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own report images" ON storage.objects FOR UPDATE USING (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add missing columns to worker_assignments for completion tracking
ALTER TABLE public.worker_assignments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.worker_assignments ADD COLUMN IF NOT EXISTS completion_notes TEXT;
ALTER TABLE public.worker_assignments ADD COLUMN IF NOT EXISTS completion_image_url TEXT;
