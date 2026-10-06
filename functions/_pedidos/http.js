import {
  verifyPassword, createSessionToken, verifySessionToken, parseCookies, timingSafeEqual,
} from '../_lib/auth.js';
import { ErrorPedido } from './core.js';

export const COOKIE_PANEL = 'pnl_session';
const TTL = 8 * 60 * 60;

/** Lee un secreto: primero la variable de Cloudflare; si no existe, la tabla `config` de la base. */
export async function secreto(env, nombre) {
  if (env[nombre]) return String(env[nombre]);
  try {
    const r = await env.DB.prepare('SELECT valor FROM config WHERE clave = ?').bind(nombre).first();
    return r ? String(r.valor) : '';
  } catch (e) { return ''; }
}

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });
}

export function errorJson(e) {
  if (e instanceof ErrorPedido) {
    const estado = e.codigo === 'sin_stock' ? 409 : e.codigo === 'cerrado' ? 403 : 400;
    return json({ ok: false, error: e.codigo, detalle: e.detalle ?? null }, estado);
  }
  console.error(e);
  return json({ ok: false, error: 'interno' }, 500);
}

export function cookiePanel(token, clear = false) {
  return `${COOKIE_PANEL}=${clear ? '' : token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${clear ? 0 : TTL}`;
}

export async function loginPanel(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'formato' }, 400); }
  const user = String(body.usuario || '');
  const pass = String(body.clave || '');
  const usuarioOk = await secreto(env, 'COCINA_USER');
  const okUser = timingSafeEqual(user.trim().toLowerCase(), usuarioOk.trim().toLowerCase());
  let okPass = false;
  try {
    okPass = await verifyPassword(pass, (await secreto(env, 'PANEL_PASS_HASH')) || (await secreto(env, 'COCINA_PASS_HASH')));
  } catch (e) {
    // Cloudflare Workers admite como máximo 100000 iteraciones de PBKDF2: un hash con más rompe el login.
    console.error('verifyPassword falló', e && e.message);
    return json({ ok: false, error: 'hash_no_soportado' }, 500);
  }
  if (!okUser || !okPass) {
    await new Promise((r) => setTimeout(r, 600)); // frena la prueba de claves
    return json({ ok: false, error: 'credenciales' }, 401);
  }
  const token = await createSessionToken(await secreto(env, 'SESSION_SECRET'), user, TTL);
  return json({ ok: true }, 200, { 'Set-Cookie': cookiePanel(token) });
}

/** Devuelve null si la sesión del panel es válida; si no, una respuesta 401. */
export async function exigirPanel(request, env, { escritura = false } = {}) {
  const tok = parseCookies(request)[COOKIE_PANEL] || '';
  const s = await verifySessionToken(await secreto(env, 'SESSION_SECRET'), tok);
  if (!s) return json({ ok: false, error: 'sesion' }, 401);
  // Anti-CSRF: las escrituras exigen JSON + cabecera propia (un sitio ajeno no puede enviarlas).
  if (escritura) {
    const ct = request.headers.get('Content-Type') || '';
    if (!ct.includes('application/json') || request.headers.get('X-Panel') !== '1')
      return json({ ok: false, error: 'csrf' }, 403);
  }
  return null;
}
