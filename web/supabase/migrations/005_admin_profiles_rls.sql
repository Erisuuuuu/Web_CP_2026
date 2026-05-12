-- Админ может править любой профиль (для блокировки/разблокировки)

CREATE POLICY "profiles: admin all"
  ON public.profiles
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
