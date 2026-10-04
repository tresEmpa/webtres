import { loginPanel, cookiePanel, json } from '../../_pedidos/http.js';

export async function onRequestPost({ request, env }) { return loginPanel(request, env); }
export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'Set-Cookie': cookiePanel('', true) });
}
