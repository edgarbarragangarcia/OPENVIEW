-- Passkeys (WebAuthn): permite entrar con Face ID / huella / Windows Hello.
--
-- El biométrico nunca llega al servidor. El dispositivo guarda la llave privada
-- y aquí solo se guarda la pública, con la que se verifica cada firma.
--
-- Ninguna de estas dos tablas se toca desde el cliente: todo pasa por la Edge
-- Function 'passkeys', que usa la service role key. Por eso quedan con RLS
-- activo y sin policies de escritura -- la service role las salta, y cualquier
-- acceso con la anon key queda bloqueado.

CREATE TABLE public.user_passkeys (
    id            bigint generated always as identity primary key,
    user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id text NOT NULL UNIQUE,          -- base64url, lo que devuelve el autenticador
    public_key    text NOT NULL,                 -- base64url (COSE)
    counter       bigint NOT NULL DEFAULT 0,     -- anti-clonación
    transports    text[],
    device_label  text,                          -- "iPhone de Edgar", para que el usuario lo reconozca
    created_at    timestamptz NOT NULL DEFAULT now(),
    last_used_at  timestamptz
);

CREATE INDEX user_passkeys_user_id_idx ON public.user_passkeys(user_id);

ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- El usuario puede ver y borrar sus propias llaves (para la pantalla de perfil).
-- El alta y la actualización del counter las hace solo la Edge Function.
CREATE POLICY "user_passkeys_own_select" ON public.user_passkeys
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_passkeys_own_delete" ON public.user_passkeys
    FOR DELETE USING (auth.uid() = user_id);


-- Los challenges se guardan server-side y son de un solo uso: si se aceptara
-- un challenge que propone el cliente, o se permitiera reusarlo, la firma
-- podría reproducirse (replay) y el passkey dejaría de proteger nada.
CREATE TABLE public.webauthn_challenges (
    id         bigint generated always as identity primary key,
    challenge  text NOT NULL,
    user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- null al autenticar
    kind       text NOT NULL CHECK (kind IN ('registration', 'authentication')),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT now() + interval '5 minutes'
);

CREATE INDEX webauthn_challenges_challenge_idx ON public.webauthn_challenges(challenge);
CREATE INDEX webauthn_challenges_expires_at_idx ON public.webauthn_challenges(expires_at);

ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;
-- Sin policies: nadie con anon key entra. Solo la service role.

-- Limpieza de challenges vencidos. La Edge Function la llama de vez en cuando;
-- también se puede agendar con pg_cron si se prefiere.
CREATE OR REPLACE FUNCTION public.purge_expired_webauthn_challenges()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    DELETE FROM public.webauthn_challenges WHERE expires_at < now();
$$;
