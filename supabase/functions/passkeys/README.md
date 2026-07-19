# Edge Function: passkeys

## Despliegue

```bash
supabase functions deploy passkeys --no-verify-jwt

supabase secrets set \
  WEBAUTHN_RP_ID=openview-three.vercel.app \
  WEBAUTHN_ORIGIN=https://openview-three.vercel.app
```

`--no-verify-jwt` es obligatorio. Las rutas `auth-options` y `auth-verify` se
llaman **sin sesión** — son el login mismo. Con la verificación de JWT activada
(el default), Supabase responde 401 antes de que el código corra, y el navegador
lo reporta como error de CORS.

Que la función sea pública no la deja abierta: `register-options` y
`register-verify` validan el token a mano con `userFromRequest()`, y las rutas de
autenticación solo devuelven una sesión si la firma del passkey verifica contra
una llave pública ya registrada.

## Requisitos previos

1. Aplicar `supabase/passkeys.sql`.
2. Los dos secrets de arriba. Si falta `WEBAUTHN_ORIGIN`, la cabecera
   `Access-Control-Allow-Origin` sale como `undefined` y todo falla con CORS.

## Desarrollo local

`rpID` debe coincidir exacto con el host, o el navegador aborta la ceremonia sin
mensaje útil:

```bash
supabase secrets set WEBAUTHN_RP_ID=localhost WEBAUTHN_ORIGIN=http://localhost:5173
```
