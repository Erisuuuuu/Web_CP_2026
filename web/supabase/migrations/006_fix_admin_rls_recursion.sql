-- Фикс рекурсии в RLS политиках: используем SECURITY DEFINER функцию

DROP POLICY IF EXISTS "profiles: admin all" ON public.profiles;
DROP POLICY IF EXISTS "clubs: admin all" ON public.clubs;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE POLICY "profiles: admin all"
  ON public.profiles
  USING (public.is_admin());

CREATE POLICY "clubs: admin all"
  ON public.clubs
  USING (public.is_admin());
