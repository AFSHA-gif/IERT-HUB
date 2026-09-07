-- ========================================================
-- IERT HUB - Production Supabase Database & Security Schema
-- B.Tech Cyber Security Semester 3 Resource Platform
-- ========================================================

-- 1. Create User Roles Table (Server-Side Role Authorization)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 2. Create Security Definer Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_student(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = check_user_id
      AND status = 'Active'
  );
$$;

-- 3. Create Resources Metadata Table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Notes, Previous Year Paper, Study Material, Assignment, Practical, Syllabus, Important Questions, Reference Material
  subject_code TEXT NOT NULL, -- e.g. CS301, CY301
  subject_name TEXT NOT NULL,
  semester INT NOT NULL DEFAULT 3,
  unit INT,
  year TEXT,
  experiment_number TEXT,
  tags TEXT[] DEFAULT '{}',
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size TEXT NOT NULL,
  uploaded_by TEXT DEFAULT 'admin@iert.ac.in',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Archived')),
  download_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_subject_code ON public.resources(subject_code);
CREATE INDEX IF NOT EXISTS idx_resources_unit ON public.resources(unit);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_at ON public.resources(uploaded_at DESC);

-- 4. Create Students Registry Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  semester INT DEFAULT 3,
  branch TEXT DEFAULT 'B.Tech Cyber Security',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- 5. Create Resource Activity Log Table
CREATE TABLE IF NOT EXISTS public.resource_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'download', 'bookmark')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_student_id ON public.resource_activity(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON public.resource_activity(timestamp DESC);

-- 6. Create Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL DEFAULT 'admin@iert.ac.in',
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON public.admin_logs(timestamp DESC);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- USER ROLES RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Users read own role / Admins read all" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- --------------------------------------------------------
-- RESOURCES RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Active students & Admins read resources" ON public.resources
  FOR SELECT
  USING (
    status = 'Active' AND (
      public.is_admin(auth.uid()) OR public.is_active_student(auth.uid())
    )
  );

CREATE POLICY "Admins manage resources" ON public.resources
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- --------------------------------------------------------
-- STUDENTS RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Students read own profile / Admins read all" ON public.students
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Allow student registration profile creation" ON public.students
  FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Students update own profile / Admins update all" ON public.students
  FOR UPDATE
  USING (
    public.is_admin(auth.uid()) OR 
    (auth.uid() = id AND public.is_active_student(auth.uid()))
  );

CREATE POLICY "Admins delete students" ON public.students
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- --------------------------------------------------------
-- RESOURCE ACTIVITY RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Active students record activity" ON public.resource_activity
  FOR INSERT
  WITH CHECK (public.is_active_student(auth.uid()));

CREATE POLICY "Students read own activity / Admins read all" ON public.resource_activity
  FOR SELECT
  USING (student_id = auth.uid()::text OR public.is_admin(auth.uid()));

-- --------------------------------------------------------
-- ADMIN LOGS RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Admins read and create audit logs" ON public.admin_logs
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- ========================================================
-- 8. PRIVATE STORAGE BUCKET SETUP: "academic-materials"
-- ========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-materials', 'academic-materials', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Active students & Admins read private storage" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'academic-materials' AND (
      public.is_admin(auth.uid()) OR public.is_active_student(auth.uid())
    )
  );

CREATE POLICY "Admins manage private storage" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'academic-materials' AND public.is_admin(auth.uid())
  );

-- ========================================================
-- 9. AUTOMATIC STUDENT PROFILE & ROLE PROVISIONING TRIGGER
-- ========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.students (id, full_name, email, semester, branch, status, registration_date, last_login)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'semester')::INT, 3),
    COALESCE(NEW.raw_user_meta_data->>'branch', 'B.Tech Cyber Security'),
    'Active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    last_login = NOW();

  INSERT INTO public.user_roles (user_id, role, active)
  VALUES (NEW.id, 'student', true)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
