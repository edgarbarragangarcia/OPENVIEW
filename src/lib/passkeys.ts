// Cliente de passkeys (WebAuthn). El navegador hace toda la parte criptográfica;
// aquí solo se llevan los mensajes de ida y vuelta a la Edge Function.

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { supabase } from './supabase';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/passkeys`;

/**
 * Hay passkeys disponibles solo si el navegador expone WebAuthn y el contexto es
 * seguro (https o localhost). En un iframe o en http la API simplemente no está.
 */
export function passkeysSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && window.isSecureContext;
}

async function post(path: string, body?: unknown, accessToken?: string) {
  const res = await fetch(`${FUNCTIONS_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Error en el servidor');
  return data;
}

/**
 * Registra el dispositivo actual como llave. Requiere sesión activa: el passkey
 * se añade a una cuenta que ya existe, no la crea.
 */
export async function registerPasskey(deviceLabel?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Debes iniciar sesión para registrar este dispositivo');

  const options = await post('register-options', {}, session.access_token);
  const response = await startRegistration({ optionsJSON: options });
  await post('register-verify', { response, deviceLabel }, session.access_token);
}

/**
 * Entra con Face ID / huella / Windows Hello, sin correo ni contraseña.
 * La sesión se establece canjeando el token de un solo uso que devuelve la función.
 */
export async function signInWithPasskey() {
  const options = await post('auth-options');
  const response = await startAuthentication({ optionsJSON: options });
  const { tokenHash } = await post('auth-verify', { response });

  // Con token_hash no se manda el email: Supabase rechaza la combinación con
  // "Only the token_hash and type should be provided".
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email',
  });
  if (error) throw error;
}

/** Llaves registradas del usuario, para la pantalla de perfil. */
export async function listPasskeys() {
  const { data, error } = await supabase
    .from('user_passkeys')
    .select('id, device_label, created_at, last_used_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function deletePasskey(id: number) {
  const { error } = await supabase.from('user_passkeys').delete().eq('id', id);
  if (error) throw error;
}
