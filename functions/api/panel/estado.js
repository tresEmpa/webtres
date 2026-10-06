import { jornadaAbierta, pedidosDeJornada } from '../../_pedidos/core.js';
import { json, errorJson, exigirPanel } from '../../_pedidos/http.js';

export async function onRequestGet({ request, env }) {
  const no = await exigirPanel(request, env);
  if (no) return no;
  try {
    const db = env.DB;
    const j = await jornadaAbierta(db);
    const { results: productos } = await db.prepare('SELECT * FROM productos ORDER BY orden, nombre').all();
    let pedidos = [];
    let cuentas = [];
    if (j) {
      pedidos = await pedidosDeJornada(db, j.id);
      const { results: cs } = await db.prepare('SELECT * FROM cuentas WHERE jornada_id = ?').bind(j.id).all();
      const porMesa = new Map();
      for (const p of pedidos) {
        const c = porMesa.get(p.mesa) || { mesa: p.mesa, entregado: 0, pendientes: 0, pagada_en: null, medio: null, aviso_transf: null };
        for (const r of p.renglones) {
          c.entregado += (p.anulado_en ? r.entregadas : r.cantidad) * r.precio;
          if (!p.anulado_en) c.pendientes += r.cantidad - r.entregadas;
        }
        porMesa.set(p.mesa, c);
      }
      for (const c of cs) { const x = porMesa.get(c.mesa); if (x) { x.pagada_en = c.pagada_en; x.medio = c.medio; x.aviso_transf = c.aviso_transf; } }
      cuentas = [...porMesa.values()];
    }
    return json({ ok: true, jornada: j, productos, pedidos, cuentas, ahora: new Date().toISOString() });
  } catch (e) { return errorJson(e); }
}
