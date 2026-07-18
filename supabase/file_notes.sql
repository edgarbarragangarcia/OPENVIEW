-- Notas de archivos por usuario (persistentes entre dispositivos)
CREATE TABLE public.file_notes (
    id          bigint generated always as identity primary key,
    user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url    text NOT NULL,
    content     text NOT NULL DEFAULT '',
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, file_url)
);

CREATE INDEX file_notes_user_id_idx ON public.file_notes(user_id);

ALTER TABLE public.file_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_notes_own_select" ON public.file_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "file_notes_own_insert" ON public.file_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "file_notes_own_update" ON public.file_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "file_notes_own_delete" ON public.file_notes FOR DELETE USING (auth.uid() = user_id);
