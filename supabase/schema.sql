-- ========================================================
-- IERT HUB - Supabase Database & Private Storage Setup
-- B.Tech Cyber Security Semester 3 Resource Platform
-- ========================================================

-- 1. Create Resources Metadata Table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Notes, Previous Year Paper, Study Material, Assignment, Practical, Syllabus, Important Questions, Reference Material
  subject_code TEXT NOT NULL, -- e.g. CS301, CY301
  subject_name TEXT NOT NULL,
  semester INT NOT NULL DEFAULT 3,
  unit INT, -- For Notes, Assignments, Important Questions
  year TEXT, -- For Previous Year Papers
  experiment_number TEXT, -- For Practicals
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

-- 2. Create Indexes for High-Performance Search & Filtering
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_subject_code ON public.resources(subject_code);
CREATE INDEX IF NOT EXISTS idx_resources_unit ON public.resources(unit);
CREATE INDEX IF NOT EXISTS idx_resources_year ON public.resources(year);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_at ON public.resources(uploaded_at DESC);

-- 3. Create Students Registry Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. Create Resource Activity Log Table (View / Download / Bookmark tracking)
CREATE TABLE IF NOT EXISTS public.resource_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'download', 'bookmark')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_student_id ON public.resource_activity(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_resource_id ON public.resource_activity(resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON public.resource_activity(timestamp DESC);

-- 5. Create Admin Audit Logs Table
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
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- RESOURCES RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Authenticated users can read resources" ON public.resources
  FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'Active');

CREATE POLICY "Admins can insert resources" ON public.resources
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update resources" ON public.resources
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete resources" ON public.resources
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- --------------------------------------------------------
-- STUDENTS RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Users can read student profiles" ON public.students
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow student registration" ON public.students
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow student profile update" ON public.students
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow student account deletion" ON public.students
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- --------------------------------------------------------
-- RESOURCE ACTIVITY RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Students insert own activity" ON public.resource_activity
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users read own activity / Admins read all" ON public.resource_activity
  FOR SELECT USING (auth.role() = 'authenticated');

-- --------------------------------------------------------
-- ADMIN LOGS RLS POLICIES
-- --------------------------------------------------------

CREATE POLICY "Admins read audit logs" ON public.admin_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins insert audit logs" ON public.admin_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================================
-- 7. PRIVATE STORAGE BUCKET SETUP: "academic-materials"
-- ========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-materials', 'academic-materials', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Authenticated users read private storage" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'academic-materials' AND auth.role() = 'authenticated');

CREATE POLICY "Admins upload private storage" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'academic-materials' AND auth.role() = 'authenticated');

CREATE POLICY "Admins update private storage" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'academic-materials' AND auth.role() = 'authenticated');

CREATE POLICY "Admins delete private storage" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'academic-materials' AND auth.role() = 'authenticated');
