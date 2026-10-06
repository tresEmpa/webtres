import { normMesa, crearPedido, obtenerPedido, cuentaDeMesa, jornadaAbierta } from '../_pedidos/core.js';
import { json, errorJson } from '../_pedidos/http.js';

const MAX_PEDIDOS_POR_DISPOSITIVO = 15;

/** Crear pedido. El id (UUID) lo genera el cliente: reintentar nunca duplica. */
export async function onRequestPost({ request, env }) {
  try {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: 'formato' }, 400); }
    const dispositivo = typeof body.dispositivo === 'string' ? body.dispositivo.slice(0, 64) : null;
    if (dispositivo) {
      const j = await jornadaAbierta(env.DB);
      if (j) {
        const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM pedidos WHERE jornada_id = ? AND dispositivo = ?')
          .bind(j.id, dispositivo).first();
        if (n.n >= MAX_PEDIDOS_POR_DISPOSITIVO) return json({ ok: false, error: 'demasiados' }, 429);
      }
    }
    const r = await crearPedido(env.DB, body, { origen: 'cliente', dispositivo });
    return json({ ok: true, duplicado: r.duplicado, pedido: r.pedido });
  } catch (e) { return errorJson(e); }
}

/** Estado de mis pedidos + cuenta de la mesa. ?mesa=3&ids=a,b,c */
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const mesa = normMesa(url.searchParams.get('mesa'));
    const ids = (url.searchParams.get('ids') || '').split(',').filter(Boolean).slice(0, 30);
    const j = await jornadaAbierta(env.DB);
    const pedidos = [];
    for (const id of ids) {
      const p = await obtenerPedido(env.DB, id);
      if (p && p.mesa === mesa) pedidos.push(p);
    }
    // La cuenta solo existe para la jornada del pedido; si ya cerró, se informa.
    const jornadaId = pedidos[0]?.jornada_id ?? j?.id;
    const cuenta = jornadaId && mesa ? await cuentaDeMesa(env.DB, jornadaId, mesa) : null;
    return json({ ok: true, abierta: !!j, jornada_id: jornadaId ?? null, pedidos, cuenta });
  } catch (e) { return errorJson(e); }
}
