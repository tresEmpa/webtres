import { jornadaAbierta, normMesa, cuentaDeMesa, pagarCuenta } from '../_pedidos/core.js';
import { json, errorJson } from '../_pedidos/http.js';

/**
 * "Ya transferí": el cliente declara el pago y la cuenta queda saldada hasta lo pedido en este momento
 * (riesgo aceptado: no se verifica la transferencia). Solo puede hacerlo un celular que hizo pedidos con ese nombre.
 */
export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json().catch(() => ({}));
    const mesa = normMesa(b.mesa);
    const dispositivo = typeof b.dispositivo === 'string' ? b.dispositivo.slice(0, 64) : '';
    const j = await jornadaAbierta(env.DB);
    if (!j || !mesa || !dispositivo) return json({ ok: false, error: 'cerrado' }, 400);
    const suyo = await env.DB.prepare(
      'SELECT 1 FROM pedidos WHERE jornada_id = ? AND mesa = ? AND dispositivo = ? LIMIT 1',
    ).bind(j.id, mesa, dispositivo).first();
    if (!suyo) return json({ ok: false, error: 'sin_pedidos' }, 403);
    const antes = await cuentaDeMesa(env.DB, j.id, mesa);
    if (antes.saldo > 0) await pagarCuenta(env.DB, j.id, mesa, 'transferencia'); // doble toque: no repite
    return json({ ok: true });
  } catch (e) { return errorJson(e); }
}
