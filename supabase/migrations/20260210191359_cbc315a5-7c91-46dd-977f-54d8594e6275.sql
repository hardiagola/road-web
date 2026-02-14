
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'worker', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin email check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = _user_id AND lower(email) = 'manthanraithatha01@gmail.com'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  damage_type TEXT,
  status TEXT DEFAULT 'Reported',
  is_urgent BOOLEAN DEFAULT false,
  urgency_reason TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_url TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0,
  estimated_completion TIMESTAMPTZ,
  additional_info TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Workers table (with pay_rate)
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specialization TEXT,
  is_available BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pay_rate NUMERIC DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Worker assignments
CREATE TABLE public.worker_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
  estimated_hours NUMERIC,
  cost_per_hour NUMERIC,
  total_cost NUMERIC,
  is_completed BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.worker_assignments ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_id UUID,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  -- Auto-link worker if email matches
  UPDATE public.workers SET user_id = NEW.id WHERE lower(email) = lower(NEW.email) AND user_id IS NULL;

  -- Auto-assign worker role if matched
  IF EXISTS (SELECT 1 FROM public.workers WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'worker') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users read/update own, admin reads all
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin reads all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

-- User roles: users read own, admin manages all
CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin reads all roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin inserts roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin updates roles" ON public.user_roles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin deletes roles" ON public.user_roles FOR DELETE USING (public.is_admin(auth.uid()));

-- Reports: users CRUD own, admin/worker reads all
CREATE POLICY "Users read own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin reads all reports" ON public.reports FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin updates reports" ON public.reports FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Worker reads assigned reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.worker_assignments wa JOIN public.workers w ON wa.worker_id = w.id WHERE wa.report_id = reports.id AND w.user_id = auth.uid())
);
CREATE POLICY "Worker updates assigned reports" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.worker_assignments wa JOIN public.workers w ON wa.worker_id = w.id WHERE wa.report_id = reports.id AND w.user_id = auth.uid())
);

-- Workers: admin manages, workers read own
CREATE POLICY "Admin manages workers" ON public.workers FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Workers read own" ON public.workers FOR SELECT USING (auth.uid() = user_id);

-- Worker assignments: admin manages, workers read own
CREATE POLICY "Admin manages assignments" ON public.worker_assignments FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Workers read own assignments" ON public.worker_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workers w WHERE w.id = worker_assignments.worker_id AND w.user_id = auth.uid())
);
CREATE POLICY "Workers update own assignments" ON public.worker_assignments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.workers w WHERE w.id = worker_assignments.worker_id AND w.user_id = auth.uid())
);

-- Notifications: users read/update own, admin inserts
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin inserts notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "System inserts notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
