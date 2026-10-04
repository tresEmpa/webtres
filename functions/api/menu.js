import { menu, jornadaAbierta } from '../_pedidos/core.js';
import { json, errorJson } from '../_pedidos/http.js';

export async function onRequestGet({ env }) {
  try {
    const j = await jornadaAbierta(env.DB);
    return json({ ok: true, abierta: !!j, productos: await menu(env.DB) });
  } catch (e) { return errorJson(e); }
}
