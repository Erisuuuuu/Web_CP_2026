ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS description TEXT;
