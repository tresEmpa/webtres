/**
 * Autenticación del admin (cocina) para Cloudflare Functions.
 * Sin dependencias: usa WebCrypto (disponible en Workers/Pages).
 *
 * - Password: hash PBKDF2-SHA256 guardado en env.COCINA_PASS_HASH con formato
 *     pbkdf2$<iteraciones>$<saltBase64>$<hashBase64>
 *   Generalo con:  node tools/hash-password.mjs "tu-contraseña"
 * - Sesión: cookie firmada con HMAC-SHA256 (secreto en env.SESSION_SECRET).
 * - CSRF: doble envío (cookie + campo del formulario).
 */

const enc = new TextEncoder();

function b64urlEncode(bytes) {
  let bin = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64ToBytes(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Comparación en tiempo constante. */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// === PBKDF2 password ===

/** Verifica una contraseña contra el hash almacenado. */
export async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  const salt = b64ToBytes(parts[2]);
  const expected = parts[3];
  if (!iterations || iterations < 1) return false;

  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key, 256,
  );
  const got = b64urlEncode(new Uint8Array(bits)).replace(/-/g, '+').replace(/_/g, '/');
  // Normalizamos ambos a base64 estándar para comparar
  const expNorm = expected.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  return timingSafeEqual(got, expNorm);
}

/** Genera un hash PBKDF2 (usado por tools/hash-password.mjs). */
export async function hashPassword(password, iterations = 210000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256,
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return `pbkdf2$${iterations}$${saltB64}$${hashB64}`;
}

// === HMAC firma ===

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
  );
}
async function hmacSign(secret, data) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

// === Sesión (cookie firmada) ===

const SESSION_COOKIE = 'tep_session';
const SESSION_TTL = 8 * 60 * 60; // 8 horas, igual que el PHP

export async function createSessionToken(secret, user, ttl = SESSION_TTL) {
  const payload = { u: user, exp: Math.floor(Date.now() / 1000) + ttl };
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(secret, token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = await hmacSign(secret, body);
  if (!timingSafeEqual(sig, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  } catch { return null; }
  if (!payload || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function sessionCookie(token, { clear = false } = {}) {
  const parts = [
    `${SESSION_COOKIE}=${clear ? '' : token}`,
    'Path=/cocina',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    clear ? 'Max-Age=0' : `Max-Age=${SESSION_TTL}`,
  ];
  return parts.join('; ');
}

// === CSRF (doble envío) ===

const CSRF_COOKIE = 'tep_csrf';

export function newCsrfToken() {
  return b64urlEncode(crypto.getRandomValues(new Uint8Array(24)));
}
export function csrfCookie(token) {
  return `${CSRF_COOKIE}=${token}; Path=/cocina; Secure; SameSite=Lax`;
}

export function parseCookies(request) {
  const header = request.headers.get('Cookie') || '';
  const out = {};
  header.split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i > -1) out[c.slice(0, i).trim()] = c.slice(i + 1).trim();
  });
  return out;
}

export const COOKIE_NAMES = { SESSION_COOKIE, CSRF_COOKIE };

/** Devuelve el payload de sesión si la request está autenticada, si no null. */
export async function getSession(request, env) {
  const cookies = parseCookies(request);
  return verifySessionToken(env.SESSION_SECRET || '', cookies[SESSION_COOKIE] || '');
}
