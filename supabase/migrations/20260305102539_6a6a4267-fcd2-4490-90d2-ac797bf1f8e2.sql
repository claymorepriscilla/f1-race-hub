
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'declined');

CREATE TABLE public.master_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('role', 'kpi_type', 'constructor')),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  default_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.master_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read master_data" ON public.master_data
  FOR SELECT TO authenticated USING (true);

CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Dev',
  constructor_id TEXT NOT NULL DEFAULT 'Alpha',
  avatar_url TEXT,
  rank_tier TEXT NOT NULL DEFAULT 'Rookie',
  total_points INT NOT NULL DEFAULT 0,
  last_point_earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.request_transaction (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kpi_type_id TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  admin_comment TEXT,
  points_awarded INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.request_transaction ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.request_transaction
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests" ON public.request_transaction
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND is_admin = true
  )
$$;

CREATE POLICY "Admins can view all requests" ON public.request_transaction
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all requests" ON public.request_transaction
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TABLE public.point_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_change INT NOT NULL,
  reason TEXT NOT NULL,
  request_id UUID REFERENCES public.request_transaction(id),
  admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own point history" ON public.point_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage point history" ON public.point_history
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, constructor_id, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Dev'),
    COALESCE(NEW.raw_user_meta_data->>'constructor_id', 'Alpha'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=' || NEW.id || '&backgroundColor=1e1e1e')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.master_data (type, value, label, default_points) VALUES
  ('role', 'Dev', 'Developer', 0),
  ('role', 'QA', 'Quality Assurance', 0),
  ('role', 'DevOps', 'DevOps Engineer', 0),
  ('constructor', 'Alpha', 'Team Alpha', 0),
  ('constructor', 'Bravo', 'Team Bravo', 0),
  ('constructor', 'Charlie', 'Team Charlie', 0),
  ('constructor', 'Delta', 'Team Delta', 0),
  ('kpi_type', 'bug_fix', 'Bug Fix', 10),
  ('kpi_type', 'feature', 'Feature Delivery', 25),
  ('kpi_type', 'code_review', 'Code Review', 5),
  ('kpi_type', 'deployment', 'Deployment', 15),
  ('kpi_type', 'documentation', 'Documentation', 8),
  ('kpi_type', 'testing', 'Test Coverage', 12),
  ('kpi_type', 'incident_resolution', 'Incident Resolution', 20),
  ('kpi_type', 'mentoring', 'Mentoring/KT', 10);

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_request_transaction_updated_at BEFORE UPDATE ON public.request_transaction
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins can manage master_data" ON public.master_data
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
