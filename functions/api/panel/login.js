import { loginPanel, cookiePanel, json } from '../../_pedidos/http.js';

export async function onRequestPost({ request, env }) { return loginPanel(request, env); }
export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'Set-Cookie': cookiePanel('', true) });
}

// DIAGNÓSTICO TEMPORAL: dice si los secretos existen y tienen forma válida (nunca sus valores). Se borra después de las pruebas.
export async function onRequestGet({ env }) {
  const h = String(env.PANEL_PASS_HASH || env.COCINA_PASS_HASH || '');
  const partes = h.split('$');
  return json({
    usuario: !!env.COCINA_USER, usuario_largo: String(env.COCINA_USER || '').length,
    hash: !!h, hash_formato_ok: partes.length === 4 && partes[0] === 'pbkdf2', hash_largo: h.length,
    secreto_sesion_largo: String(env.SESSION_SECRET || '').length, base_de_datos: !!env.DB,
  });
}
