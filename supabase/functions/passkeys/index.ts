// Edge Function: ceremonias WebAuthn (passkeys).
//
// Cuatro rutas:
//   POST /passkeys/register-options  (requiere sesión) -> opciones para crear la llave
//   POST /passkeys/register-verify   (requiere sesión) -> guarda la llave pública
//   POST /passkeys/auth-options      (público)         -> challenge para autenticar
//   POST /passkeys/auth-verify       (público)         -> verifica firma y devuelve sesión
//
// La verificación tiene que pasar sí o sí por aquí: es lo único que corre con la
// service role key y con el origin/rpID esperados. Si esto se hiciera en el
// cliente, cualquiera podría afirmar "verifiqué bien" y entrar.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from 'https://esm.sh/@simplewebauthn/server@13.1.1';

const RP_NAME = 'Open View Academy';

// Orígenes permitidos. El rpID (el dominio "dueño" del passkey) se deriva del
// origen de cada petición: tiene que coincidir exacto con el host desde el que
// se usa, o el navegador aborta la ceremonia sin explicación.
//
// Se deriva por petición en vez de leerse de un secret porque así producción y
// desarrollo funcionan sin configuración extra, y no hay forma de dejar el
// deploy a medias con una variable sin definir.
const ALLOWED_ORIGINS = [
  'https://openview-three.vercel.app',
  'http://localhost:5173',
  ...(Deno.env.get('WEBAUTHN_EXTRA_ORIGINS')?.split(',').map((o) => o.trim()) ?? []),
];

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

/** Devuelve el origen si está permitido; si no, el de producción. */
function resolveOrigin(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
});

const json = (body: unknown, status = 200, origin = ALLOWED_ORIGINS[0]) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });

const b64url = {
  encode: (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  decode: (text: string) => {
    const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  },
};

/** Devuelve el usuario dueño del JWT que viene en el header, o null. */
async function userFromRequest(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

/** Consume un challenge: lo valida y lo borra, para que no se pueda reusar. */
async function consumeChallenge(challenge: string, kind: string) {
  const { data } = await admin
    .from('webauthn_challenges')
    .select('id, user_id, expires_at')
    .eq('challenge', challenge)
    .eq('kind', kind)
    .maybeSingle();

  if (!data) return null;
  await admin.from('webauthn_challenges').delete().eq('id', data.id);
  if (new Date(data.expires_at) < new Date()) return null;
  return data;
}

Deno.serve(async (req) => {
  const origin = resolveOrigin(req);
  // El preflight tiene que responder 200 antes de cualquier otra cosa: si algo
  // falla aquí, el navegador lo reporta como error de CORS y nunca se ve la
  // causa real.
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });

  const RP_ID = new URL(origin).hostname;
  const route = new URL(req.url).pathname.split('/').pop();

  try {
    // ---- Registro: el usuario ya inició sesión y quiere añadir su dispositivo ----
    if (route === 'register-options') {
      const user = await userFromRequest(req);
      if (!user) return json({ error: 'No autenticado' }, 401, origin);

      const { data: existing } = await admin
        .from('user_passkeys')
        .select('credential_id, transports')
        .eq('user_id', user.id);

      const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: new TextEncoder().encode(user.id),
        userName: user.email ?? user.id,
        attestationType: 'none',
        // Evita registrar dos veces el mismo dispositivo.
        excludeCredentials: (existing ?? []).map((c) => ({
          id: c.credential_id,
          transports: c.transports ?? undefined,
        })),
        authenticatorSelection: {
          // residentKey: la llave se guarda en el dispositivo, lo que permite
          // entrar sin escribir correo (que es justamente lo que se buscaba).
          residentKey: 'required',
          userVerification: 'required',
        },
      });

      await admin.from('webauthn_challenges').insert({
        challenge: options.challenge,
        user_id: user.id,
        kind: 'registration',
      });

      return json(options, 200, origin);
    }

    if (route === 'register-verify') {
      const user = await userFromRequest(req);
      if (!user) return json({ error: 'No autenticado' }, 401, origin);

      const { response, deviceLabel } = await req.json();
      const clientData = JSON.parse(
        new TextDecoder().decode(b64url.decode(response.response.clientDataJSON)),
      );

      const stored = await consumeChallenge(clientData.challenge, 'registration');
      if (!stored || stored.user_id !== user.id) {
        return json({ error: 'Challenge inválido o vencido' }, 400, origin);
      }

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: clientData.challenge,
        expectedOrigin: origin,
        expectedRPID: RP_ID,
        requireUserVerification: true,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return json({ error: 'No se pudo verificar la llave' }, 400, origin);
      }

      const { credential } = verification.registrationInfo;
      const { error } = await admin.from('user_passkeys').insert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: b64url.encode(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports ?? null,
        device_label: deviceLabel ?? null,
      });
      if (error) return json({ error: error.message }, 400, origin);

      return json({ verified: true }, 200, origin);
    }

    // ---- Autenticación: sin correo ni contraseña ----
    if (route === 'auth-options') {
      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        userVerification: 'required',
        // Vacío a propósito: con residentKey el navegador ofrece las llaves
        // que tenga para este dominio y el usuario elige.
        allowCredentials: [],
      });

      await admin.from('webauthn_challenges').insert({
        challenge: options.challenge,
        kind: 'authentication',
      });

      // Aprovechamos para barrer los vencidos.
      await admin.rpc('purge_expired_webauthn_challenges');

      return json(options, 200, origin);
    }

    if (route === 'auth-verify') {
      const { response } = await req.json();
      const clientData = JSON.parse(
        new TextDecoder().decode(b64url.decode(response.response.clientDataJSON)),
      );

      const stored = await consumeChallenge(clientData.challenge, 'authentication');
      if (!stored) return json({ error: 'Challenge inválido o vencido' }, 400, origin);

      const { data: passkey } = await admin
        .from('user_passkeys')
        .select('*')
        .eq('credential_id', response.id)
        .maybeSingle();

      if (!passkey) return json({ error: 'Llave no reconocida' }, 400, origin);

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: clientData.challenge,
        expectedOrigin: origin,
        expectedRPID: RP_ID,
        requireUserVerification: true,
        credential: {
          id: passkey.credential_id,
          publicKey: b64url.decode(passkey.public_key),
          counter: Number(passkey.counter),
          transports: passkey.transports ?? undefined,
        },
      });

      if (!verification.verified) return json({ error: 'Firma inválida' }, 401, origin);

      // El counter que sube evita que sirva una llave clonada.
      await admin
        .from('user_passkeys')
        .update({
          counter: verification.authenticationInfo.newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', passkey.id);

      // Supabase no deja firmar sesiones a mano, así que se genera un magic link
      // y se devuelve solo el token_hash: el cliente lo canjea con verifyOtp y
      // obtiene una sesión normal. El correo no se envía.
      const { data: userRow } = await admin.auth.admin.getUserById(passkey.user_id);
      if (!userRow?.user?.email) return json({ error: 'Usuario sin correo' }, 400, origin);

      const { data: link, error: linkError } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: userRow.user.email,
      });
      if (linkError) return json({ error: linkError.message }, 400, origin);

      return json({
        verified: true,
        tokenHash: link.properties.hashed_token,
        email: userRow.user.email,
      }, 200, origin);
    }

    return json({ error: 'Ruta no encontrada' }, 404, origin);
  } catch (err) {
    console.error(err);
    return json({ error: 'Error inesperado' }, 500, origin);
  }
});
