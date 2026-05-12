-- ─── Атомарная защита от перепревышения мест ──────────────────────────────────
-- BEFORE INSERT триггер блокирует запись если seats_taken >= seats_total.

CREATE OR REPLACE FUNCTION public.check_seats_before_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total integer;
  v_taken integer;
BEGIN
  SELECT seats_total, seats_taken INTO v_total, v_taken
  FROM public.meetings WHERE id = NEW.meeting_id FOR UPDATE;

  IF v_taken >= v_total THEN
    RAISE EXCEPTION 'seats_full' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_registrations_check_seats ON public.registrations;
CREATE TRIGGER trg_registrations_check_seats
BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.check_seats_before_registration();

-- ─── Чистка перепревышенных регистраций ────────────────────────────────────────
-- Оставляем только первые seats_total записей (по registered_at), остальные удаляем.

WITH ranked AS (
  SELECT
    r.id,
    ROW_NUMBER() OVER (PARTITION BY r.meeting_id ORDER BY r.registered_at) AS rn,
    m.seats_total
  FROM public.registrations r
  JOIN public.meetings m ON m.id = r.meeting_id
)
DELETE FROM public.registrations
WHERE id IN (SELECT id FROM ranked WHERE rn > seats_total);

-- Пересчитываем счётчик после чистки
UPDATE public.meetings m
SET seats_taken = COALESCE((
  SELECT COUNT(*)::integer FROM public.registrations r WHERE r.meeting_id = m.id
), 0);
