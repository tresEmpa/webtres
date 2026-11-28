import { jornadaAbierta, resumenJornada } from '../../_pedidos/core.js';
import { json, errorJson, exigirPanel } from '../../_pedidos/http.js';

/** Lo que resta cobrar de una noche: ?jornada=ID, o la abierta, o la última cerrada. */
export async function onRequestGet({ request, env }) {
  const no = await exigirPanel(request, env);
  if (no) return no;
  try {
    const db = env.DB;
    let id = Number(new URL(request.url).searchParams.get('jornada'));
    if (!id) id = (await jornadaAbierta(db))?.id;
    if (!id) id = (await db.prepare('SELECT id FROM jornadas ORDER BY id DESC LIMIT 1').first())?.id;
    const r = id ? await resumenJornada(db, id) : null;
    if (!r) return json({ ok: false, error: 'sin_jornada' }, 404);
    return json({ ok: true, ...r });
  } catch (e) { return errorJson(e); }
}
