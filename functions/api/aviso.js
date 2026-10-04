import { jornadaAbierta } from '../_pedidos/core.js';
import { json, errorJson } from '../_pedidos/http.js';

/** El cliente avisa "ya transferí". Solo marca la cuenta; el que confirma el pago es la barra. */
export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json().catch(() => ({}));
    const mesa = String(b.mesa || '').trim().slice(0, 20);
    const j = await jornadaAbierta(env.DB);
    if (!j || !mesa) return json({ ok: false, error: 'cerrado' }, 400);
    const r = await env.DB.prepare(
      'UPDATE cuentas SET aviso_transf = COALESCE(aviso_transf, ?) WHERE jornada_id = ? AND mesa = ?',
    ).bind(new Date().toISOString(), j.id, mesa).run();
    return json({ ok: !!r.meta.changes });
  } catch (e) { return errorJson(e); }
}
