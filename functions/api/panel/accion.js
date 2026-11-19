import {
  abrirJornada, cerrarJornada, entregarTodo, fijarEntregadas, anularPedido, pagarCuenta,
  fijarStock, crearPedido, jornadaAbierta, cuentaDeMesa, normMesa, ErrorPedido,
} from '../../_pedidos/core.js';
import { json, errorJson, exigirPanel, secreto } from '../../_pedidos/http.js';
import { verifyPassword, hashPassword } from '../../_lib/auth.js';

const MEDIOS = ['efectivo', 'transferencia', 'qr', 'tarjeta'];

export async function onRequestPost({ request, env }) {
  const no = await exigirPanel(request, env, { escritura: true });
  if (no) return no;
  try {
    const db = env.DB;
    const b = await request.json();
    switch (b.tipo) {
      case 'abrir_jornada': return json({ ok: true, jornada: await abrirJornada(db) });
      case 'cerrar_jornada': return json({ ok: true, jornada: await cerrarJornada(db) });
      case 'entregar_todo': await entregarTodo(db, String(b.pedido_id)); break;
      case 'fijar_entregadas': await fijarEntregadas(db, Number(b.renglon_id), Number(b.entregadas)); break;
      case 'anular': await anularPedido(db, String(b.pedido_id)); break;
      case 'pagar': {
        const j = await jornadaAbierta(db);
        if (!j) throw new ErrorPedido('cerrado');
        const medio = MEDIOS.includes(b.medio) ? b.medio : null;
        return json({ ok: true, cuenta: await pagarCuenta(db, j.id, normMesa(b.mesa), medio) });
      }
      case 'cuenta': {
        const j = await jornadaAbierta(db);
        if (!j) throw new ErrorPedido('cerrado');
        return json({ ok: true, cuenta: await cuentaDeMesa(db, j.id, normMesa(b.mesa)) });
      }
      case 'fijar_stock': await fijarStock(db, String(b.producto_id), Number(b.stock), b.motivo === 'carga' ? 'carga' : 'ajuste'); break;
      case 'producto': {
        const id = String(b.producto_id);
        const sets = []; const vals = [];
        if (b.modo === 'auto' || b.modo === 'manual') { sets.push('modo = ?'); vals.push(b.modo); }
        if (b.disponible === 0 || b.disponible === 1) { sets.push('disponible = ?'); vals.push(b.disponible); }
        if (b.activo === 0 || b.activo === 1) { sets.push('activo = ?'); vals.push(b.activo); }
        if (Number.isInteger(b.precio) && b.precio >= 0) { sets.push('precio = ?'); vals.push(b.precio); }
        if (!sets.length) throw new ErrorPedido('nada_para_cambiar');
        await db.prepare(`UPDATE productos SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
        break;
      }
      case 'pedido_barra': {
        const r = await crearPedido(db, b.pedido, { origen: 'barra' });
        return json({ ok: true, duplicado: r.duplicado, pedido: r.pedido });
      }
      case 'interruptor': {
        const v = b.prendido ? '1' : '0';
        await db.prepare("INSERT INTO config (clave, valor) VALUES ('CARTA_NUEVA', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor").bind(v).run();
        break;
      }
      case 'cambiar_clave': {
        // Guarda usuario y clave del panel en la tabla config de ESTA base (no toca /cocina).
        const actual = (await secreto(env, 'PANEL_PASS_HASH')) || (await secreto(env, 'COCINA_PASS_HASH'));
        if (!(await verifyPassword(String(b.actual || ''), actual))) throw new ErrorPedido('clave_actual_mal');
        const usuario = String(b.usuario || '').trim().toLowerCase();
        const nueva = String(b.nueva || '');
        if (usuario.length < 3 || nueva.length < 6) throw new ErrorPedido('muy_corta');
        const h = await hashPassword(nueva, 100000);
        await db.batch([
          db.prepare("INSERT INTO config (clave, valor) VALUES ('PANEL_USER', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor").bind(usuario),
          db.prepare("INSERT INTO config (clave, valor) VALUES ('PANEL_PASS_HASH', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor").bind(h),
        ]);
        break;
      }
      default: throw new ErrorPedido('accion_desconocida');
    }
    return json({ ok: true });
  } catch (e) { return errorJson(e); }
}
