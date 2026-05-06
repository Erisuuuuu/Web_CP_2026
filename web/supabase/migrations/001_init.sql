-- Language Club Platform — начальная схема БД
-- Вставить в Supabase SQL Editor и выполнить

-- ─── Таблицы ──────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL DEFAULT '',
  bio         TEXT,
  cefr_level  VARCHAR(2)  CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  avatar_url  TEXT,
  role        VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.clubs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meetings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID        REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  title       VARCHAR(200) NOT NULL,
  date        TIMESTAMPTZ NOT NULL,
  location    TEXT,
  seats_total INT         NOT NULL CHECK (seats_total > 0),
  cefr_level  VARCHAR(2)  CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.registrations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meeting_id    UUID        REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, meeting_id)
);

-- ─── Триггер: создать профиль при регистрации ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── RLS: включить для всех таблиц ────────────────────────────────────────────

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ─── RLS: profiles ────────────────────────────────────────────────────────────

CREATE POLICY "profiles: select all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── RLS: clubs ───────────────────────────────────────────────────────────────

CREATE POLICY "clubs: select active or own"
  ON public.clubs FOR SELECT
  USING (is_active = true OR auth.uid() = owner_id);

CREATE POLICY "clubs: insert authenticated"
  ON public.clubs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "clubs: update own"
  ON public.clubs FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "clubs: delete own"
  ON public.clubs FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "clubs: admin all"
  ON public.clubs USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ─── RLS: meetings ────────────────────────────────────────────────────────────

CREATE POLICY "meetings: select all"
  ON public.meetings FOR SELECT
  USING (true);

CREATE POLICY "meetings: insert by club owner"
  ON public.meetings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE id = club_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "meetings: update by club owner"
  ON public.meetings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE id = club_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "meetings: delete by club owner"
  ON public.meetings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clubs
      WHERE id = club_id AND owner_id = auth.uid()
    )
  );

-- ─── RLS: registrations ───────────────────────────────────────────────────────

-- Участник видит свои записи; организатор видит записи на свои встречи
CREATE POLICY "registrations: select own or organizer"
  ON public.registrations FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.meetings m
      JOIN public.clubs c ON m.club_id = c.id
      WHERE m.id = meeting_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "registrations: insert own"
  ON public.registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "registrations: delete own"
  ON public.registrations FOR DELETE
  USING (auth.uid() = user_id);
