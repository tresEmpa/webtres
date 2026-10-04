import {
  verifyPassword, createSessionToken, verifySessionToken, parseCookies, timingSafeEqual,
} from '../_lib/auth.js';
import { ErrorPedido } from './core.js';

export const COOKIE_PANEL = 'pnl_session';
const TTL = 8 * 60 * 60;

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
  const okUser = timingSafeEqual(user, String(env.COCINA_USER || ''));
  const okPass = await verifyPassword(pass, env.PANEL_PASS_HASH || env.COCINA_PASS_HASH);
  if (!okUser || !okPass) {
    await new Promise((r) => setTimeout(r, 600)); // frena la prueba de claves
    return json({ ok: false, error: 'credenciales' }, 401);
  }
  const token = await createSessionToken(env.SESSION_SECRET || '', user, TTL);
  return json({ ok: true }, 200, { 'Set-Cookie': cookiePanel(token) });
}

/** Devuelve null si la sesión del panel es válida; si no, una respuesta 401. */
export async function exigirPanel(request, env, { escritura = false } = {}) {
  const tok = parseCookies(request)[COOKIE_PANEL] || '';
  const s = await verifySessionToken(env.SESSION_SECRET || '', tok);
  if (!s) return json({ ok: false, error: 'sesion' }, 401);
  // Anti-CSRF: las escrituras exigen JSON + cabecera propia (un sitio ajeno no puede enviarlas).
  if (escritura) {
    const ct = request.headers.get('Content-Type') || '';
    if (!ct.includes('application/json') || request.headers.get('X-Panel') !== '1')
      return json({ ok: false, error: 'csrf' }, 403);
  }
  return null;
}
