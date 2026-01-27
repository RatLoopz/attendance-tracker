-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  college_name TEXT,
  semester TEXT,
  degree_program TEXT,
  graduation_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create semester_configurations table
CREATE TABLE IF NOT EXISTS public.semester_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  academic_year TEXT NOT NULL,
  semester_type TEXT NOT NULL CHECK (semester_type IN ('odd', 'even')),
  subjects JSONB NOT NULL,
  schedule JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_date ON public.attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_subject ON public.attendance_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_semester_configurations_user ON public.semester_configurations(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Create policies for attendance_records
CREATE POLICY "Users can view own attendance records" ON public.attendance_records FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own attendance records" ON public.attendance_records FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own attendance records" ON public.attendance_records FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own attendance records" ON public.attendance_records FOR DELETE USING (auth.uid()::text = user_id);

-- Create policies for semester_configurations
CREATE POLICY "Users can view own semester configurations" ON public.semester_configurations FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own semester configurations" ON public.semester_configurations FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own semester configurations" ON public.semester_configurations FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own semester configurations" ON public.semester_configurations FOR DELETE USING (auth.uid()::text = user_id);
