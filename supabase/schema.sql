-- ═══════════════════════════════════════════════════════
-- RESILIA Database Schema — Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  country_code TEXT DEFAULT '',
  age_group TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  has_disaster_experience BOOLEAN DEFAULT NULL,
  bio TEXT DEFAULT '',
  avatar_color TEXT DEFAULT '#14B8A6',
  avatar_url TEXT DEFAULT '',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_xp_earned INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  onboarded BOOLEAN DEFAULT FALSE,
  join_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Progress (JSONB for flexible game state)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_acts JSONB DEFAULT '[]'::jsonb,
  completed_quests JSONB DEFAULT '[]'::jsonb,
  completed_bridges JSONB DEFAULT '[]'::jsonb,
  completed_chapter_quests JSONB DEFAULT '[]'::jsonb,
  lia_eval_scores JSONB DEFAULT '{}'::jsonb,
  erq_scores JSONB DEFAULT '{}'::jsonb,
  story_progress JSONB DEFAULT '{"currentChapter":"ch1","currentAct":null,"narrativeFlags":{}}'::jsonb,
  sim_hp INTEGER DEFAULT 100,
  sim_checkpoint TEXT DEFAULT 'ch1h',
  personalization JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  locale TEXT DEFAULT 'en',
  dark_mode BOOLEAN DEFAULT FALSE,
  login_streak INTEGER DEFAULT 1,
  login_rewards_collected INTEGER DEFAULT 0,
  reward_history JSONB DEFAULT '[]'::jsonb,
  daily_session JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- Row-Level Security (RLS) — users can only access own data
-- ═══════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/write own row
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Progress: users can read/write own row
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = id);

-- Settings: users can read/write own row
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════
-- Auto-create profile/progress/settings on user signup
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  INSERT INTO public.user_progress (id) VALUES (NEW.id);
  INSERT INTO public.user_settings (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: auto-create rows when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
