-- Registro de conexiones de usuarios (horarios y número de veces que ingresan)
CREATE TABLE public.login_events (
    id          bigint generated always as identity primary key,
    user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    logged_in_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX login_events_user_id_idx ON public.login_events(user_id);
CREATE INDEX login_events_logged_in_at_idx ON public.login_events(logged_in_at);

ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "login_events_own_insert" ON public.login_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "login_events_own_select" ON public.login_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "login_events_admin_select" ON public.login_events FOR SELECT USING (public.is_admin());
