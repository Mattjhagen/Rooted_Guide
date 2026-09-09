-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Add subscription columns if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_starts_at timestamp with time zone DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS entitlement_status text DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_lifetime_tester boolean DEFAULT false;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid duplicate errors, then recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Daily Sessions Table
CREATE TABLE IF NOT EXISTS public.daily_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  completed_at timestamp with time zone,
  next_devotional_available_at timestamp with time zone,
  last_module text,
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage own sessions" ON public.daily_sessions;
CREATE POLICY "Manage own sessions" ON public.daily_sessions FOR ALL USING (auth.uid() = user_id);

-- 3. Reflections Table
CREATE TABLE IF NOT EXISTS public.reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  kind text NOT NULL,
  content text NOT NULL,
  book text,
  chapter integer,
  verse integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage own reflections" ON public.reflections;
CREATE POLICY "Manage own reflections" ON public.reflections FOR ALL USING (auth.uid() = user_id);

-- 4. Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- 5. Highlights Table
CREATE TABLE IF NOT EXISTS public.highlights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  color text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage own highlights" ON public.highlights;
CREATE POLICY "Manage own highlights" ON public.highlights FOR ALL USING (auth.uid() = user_id);

-- 6. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  kind text NOT NULL,
  content text NOT NULL,
  book text,
  chapter integer,
  verse integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manage own notes" ON public.notes;
CREATE POLICY "Manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
