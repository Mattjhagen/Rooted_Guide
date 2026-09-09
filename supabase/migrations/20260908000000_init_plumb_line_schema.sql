-- Plumb Line Supabase Initial Migration
-- Postgres Schema & Row Level Security (RLS) Policies for Multi-Device Sync

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Daily Sessions
CREATE TABLE IF NOT EXISTS public.daily_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  next_devotional_available_at TIMESTAMPTZ,
  last_module TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Daily Modules
CREATE TABLE IF NOT EXISTS public.daily_modules (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES public.daily_sessions(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL CHECK (module_type IN ('arrive', 'read', 'reflect', 'respond', 'close')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Reflections & Responses
CREATE TABLE IF NOT EXISTS public.reflections (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES public.daily_modules(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('reflection', 'prayer', 'response', 'arrive', 'close')),
  content TEXT NOT NULL,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 5. Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book, chapter, verse)
);

-- 6. Highlights
CREATE TABLE IF NOT EXISTS public.highlights (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'purple')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, book, chapter, verse)
);

-- 7. Notes
CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('reflection', 'prayer')),
  content TEXT NOT NULL,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date ON public.daily_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_modules_user_session ON public.daily_modules(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_updated ON public.reflections(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_verse ON public.bookmarks(user_id, book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_highlights_user_verse ON public.highlights(user_id, book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON public.notes(user_id, updated_at DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Ensure users can only access/modify their own rows
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own daily_sessions" ON public.daily_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily_modules" ON public.daily_modules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reflections" ON public.reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own highlights" ON public.highlights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
