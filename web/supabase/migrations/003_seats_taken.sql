-- ─── Денормализация счётчика занятых мест ────────────────────────────────────
-- Проблема: RLS на registrations скрывает чужие записи, поэтому
-- агрегат registrations(count) под обычным юзером возвращает 0.
-- Решение: хранить seats_taken в meetings, обновлять триггером с SECURITY DEFINER.

ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS seats_taken integer NOT NULL DEFAULT 0;

-- Инициализация существующих данных
UPDATE public.meetings m
SET seats_taken = COALESCE((
  SELECT COUNT(*)::integer FROM public.registrations r WHERE r.meeting_id = m.id
), 0);

CREATE OR REPLACE FUNCTION public.update_meeting_seats_taken()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.meetings SET seats_taken = seats_taken + 1 WHERE id = NEW.meeting_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.meetings SET seats_taken = GREATEST(seats_taken - 1, 0) WHERE id = OLD.meeting_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_registrations_seats_taken ON public.registrations;
CREATE TRIGGER trg_registrations_seats_taken
AFTER INSERT OR DELETE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_meeting_seats_taken();
