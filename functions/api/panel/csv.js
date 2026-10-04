import { jornadaAbierta } from '../../_pedidos/core.js';
import { exigirPanel, json } from '../../_pedidos/http.js';

const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** CSV de una jornada (por defecto la abierta, o ?jornada=ID) para guardar al cerrar. */
export async function onRequestGet({ request, env }) {
  const no = await exigirPanel(request, env);
  if (no) return no;
  const url = new URL(request.url);
  let id = Number(url.searchParams.get('jornada'));
  if (!id) id = (await jornadaAbierta(env.DB))?.id;
  if (!id) return json({ ok: false, error: 'sin_jornada' }, 404);
  const { results } = await env.DB.prepare(
    `SELECT p.id AS pedido, p.mesa, p.creado_en, p.origen, p.anulado_en, r.nombre, r.cantidad, r.entregadas, r.precio
     FROM renglones r JOIN pedidos p ON p.id = r.pedido_id WHERE p.jornada_id = ? ORDER BY p.creado_en, r.id`,
  ).bind(id).all();
  const cab = ['pedido', 'mesa', 'hora', 'origen', 'anulado', 'producto', 'pedidas', 'entregadas', 'precio', 'importe_entregado'];
  const filas = results.map((r) => [r.pedido, r.mesa, r.creado_en, r.origen, r.anulado_en || '', r.nombre, r.cantidad, r.entregadas, r.precio, r.entregadas * r.precio].map(q).join(','));
  return new Response('﻿' + [cab.join(','), ...filas].join('\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="jornada-${id}.csv"` },
  });
}
