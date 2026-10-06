import { jornadaAbierta, normMesa } from '../_pedidos/core.js';
import { json, errorJson } from '../_pedidos/http.js';

/** El cliente avisa "ya transferí". Solo marca la cuenta; el que confirma el pago es la barra. */
export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json().catch(() => ({}));
    const mesa = normMesa(b.mesa);
    const j = await jornadaAbierta(env.DB);
    if (!j || !mesa) return json({ ok: false, error: 'cerrado' }, 400);
    const ts = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO cuentas (jornada_id, mesa, aviso_transf) VALUES (?,?,?)
       ON CONFLICT (jornada_id, mesa) DO UPDATE SET aviso_transf = excluded.aviso_transf`,
    ).bind(j.id, mesa, ts).run();
    return json({ ok: true });
  } catch (e) { return errorJson(e); }
}
