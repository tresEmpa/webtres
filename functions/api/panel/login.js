import { loginPanel, cookiePanel, json, secreto } from '../../_pedidos/http.js';

export async function onRequestPost({ request, env }) { return loginPanel(request, env); }
export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'Set-Cookie': cookiePanel('', true) });
}

// DIAGNÓSTICO TEMPORAL: dice si los secretos existen y tienen forma válida (nunca sus valores). Se borra después de las pruebas.
export async function onRequestGet({ env }) {
  const h = (await secreto(env, 'PANEL_PASS_HASH')) || (await secreto(env, 'COCINA_PASS_HASH'));
  const u = await secreto(env, 'COCINA_USER');
  const ss = await secreto(env, 'SESSION_SECRET');
  const partes = h.split('$');
  return json({
    usuario: !!u, usuario_largo: u.length,
    hash: !!h, hash_formato_ok: partes.length === 4 && partes[0] === 'pbkdf2', hash_largo: h.length,
    secreto_sesion_largo: ss.length, base_de_datos: !!env.DB,
  });
}
