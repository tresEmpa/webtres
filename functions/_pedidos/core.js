/**
 * Núcleo del sistema de pedidos (carta + panel). Sin dependencias.
 * Todas las escrituras críticas van en UN lote (db.batch) = una transacción:
 * o se aplica todo o no se aplica nada.
 *
 * Anti-duplicados: el id del pedido lo genera el cliente (UUID) y es clave primaria.
 * Anti-sobreventa: guardia en el lote + CHECK (stock >= 0) en la base.
 */

export const TOPE_POR_RENGLON = 99;
export const TOPE_RENGLONES = 20;
const RE_ID = /^[A-Za-z0-9-]{16,64}$/;

const ahora = () => new Date().toISOString();

export class ErrorPedido extends Error {
  constructor(codigo, detalle) {
    super(codigo);
    this.codigo = codigo;
    this.detalle = detalle;
  }
}

// ---------- Jornada ----------

export async function jornadaAbierta(db) {
  return db.prepare('SELECT * FROM jornadas WHERE cerrada_en IS NULL ORDER BY id DESC LIMIT 1').first();
}

export async function abrirJornada(db) {
  const j = await jornadaAbierta(db);
  if (j) return j; // idempotente
  await db.prepare('INSERT INTO jornadas (abierta_en) VALUES (?)').bind(ahora()).run();
  return jornadaAbierta(db);
}

export async function cerrarJornada(db) {
  const j = await jornadaAbierta(db);
  if (!j) return null;
  await db.prepare('UPDATE jornadas SET cerrada_en = ? WHERE id = ?').bind(ahora(), j.id).run();
  return j;
}

// ---------- Menú ----------

export async function menu(db) {
  const { results } = await db
    .prepare('SELECT * FROM productos WHERE activo = 1 ORDER BY orden, nombre')
    .all();
  return results.map(vistaProducto);
}

function vistaProducto(p) {
  let disponible;
  let quedan = null;
  if (p.control === 'ninguno') disponible = true;
  else if (p.control === 'hayno' || p.modo === 'manual') disponible = p.disponible === 1;
  else {
    quedan = p.stock;
    disponible = p.stock > 0;
  }
  return {
    id: p.id, nombre: p.nombre, categoria: p.categoria, precio: p.precio,
    control: p.control, modo: p.modo, disponible, quedan,
  };
}

// ---------- Crear pedido ----------

function validar(entrada) {
  const { id, mesa, items } = entrada || {};
  if (typeof id !== 'string' || !RE_ID.test(id)) throw new ErrorPedido('id_invalido');
  const m = typeof mesa === 'string' ? mesa.trim() : '';
  if (!m || m.length > 20) throw new ErrorPedido('mesa_invalida');
  if (!Array.isArray(items) || items.length === 0 || items.length > TOPE_RENGLONES)
    throw new ErrorPedido('items_invalidos');
  const juntos = new Map(); // mismo producto repetido -> se suma
  for (const it of items) {
    const c = it && it.cantidad;
    if (!it || typeof it.producto_id !== 'string' || !Number.isInteger(c) || c < 1)
      throw new ErrorPedido('items_invalidos');
    juntos.set(it.producto_id, (juntos.get(it.producto_id) || 0) + c);
  }
  for (const c of juntos.values()) if (c > TOPE_POR_RENGLON) throw new ErrorPedido('tope_cantidad');
  return { id, mesa: m, items: [...juntos].map(([producto_id, cantidad]) => ({ producto_id, cantidad })) };
}

export async function crearPedido(db, entrada, { origen = 'cliente', dispositivo = null } = {}) {
  const { id, mesa, items } = validar(entrada);

  // Reintento del mismo pedido: se devuelve el original, no se crea otro.
  const previo = await obtenerPedido(db, id);
  if (previo) return { duplicado: true, pedido: previo };

  const jornada = await jornadaAbierta(db);
  if (!jornada) throw new ErrorPedido('cerrado');

  const ids = items.map((i) => i.producto_id);
  const { results: prods } = await db
    .prepare(`SELECT * FROM productos WHERE id IN (${ids.map(() => '?').join(',')})`)
    .bind(...ids)
    .all();
  const porId = new Map(prods.map((p) => [p.id, p]));
  for (const it of items) if (!porId.get(it.producto_id)?.activo) throw new ErrorPedido('producto_inexistente', it.producto_id);

  const t = ahora();
  const lote = [
    db.prepare('INSERT INTO pedidos (id, jornada_id, mesa, dispositivo, origen, creado_en) VALUES (?,?,?,?,?,?)')
      .bind(id, jornada.id, mesa, dispositivo, origen, t),
    db.prepare('INSERT OR IGNORE INTO cuentas (jornada_id, mesa) VALUES (?,?)').bind(jornada.id, mesa),
  ];
  for (const it of items) {
    const p = porId.get(it.producto_id);
    // Guardia: si no hay disponibilidad, ok queda NULL y TODO el lote se revierte.
    lote.push(
      db.prepare(
        `INSERT INTO guardia (ok) SELECT CASE WHEN activo = 1 AND (
            control = 'ninguno'
         OR (modo = 'manual' AND disponible = 1)
         OR (control = 'hayno' AND disponible = 1)
         OR (control = 'cantidad' AND modo = 'auto' AND stock >= ?)
         ) THEN 1 END FROM productos WHERE id = ?`,
      ).bind(it.cantidad, p.id),
      db.prepare(
        `INSERT INTO movimientos_stock (producto_id, delta, motivo, pedido_id, creado_en)
         SELECT id, ?, 'pedido', ?, ? FROM productos WHERE id = ? AND control = 'cantidad' AND modo = 'auto'`,
      ).bind(-it.cantidad, id, t, p.id),
      db.prepare(
        `UPDATE productos SET stock = stock - ? WHERE id = ? AND control = 'cantidad' AND modo = 'auto'`,
      ).bind(it.cantidad, p.id),
      // El precio sale de la base, nunca del cliente.
      db.prepare('INSERT INTO renglones (pedido_id, producto_id, nombre, precio, cantidad) VALUES (?,?,?,?,?)')
        .bind(id, p.id, p.nombre, p.precio, it.cantidad),
    );
  }

  try {
    await db.batch(lote);
  } catch (e) {
    // Carrera: otro envío del mismo id ganó, o se acabó el stock justo ahora.
    const ya = await obtenerPedido(db, id);
    if (ya) return { duplicado: true, pedido: ya };
    const faltan = await sinDisponibilidad(db, items);
    if (faltan.length) throw new ErrorPedido('sin_stock', faltan);
    throw e;
  }
  return { duplicado: false, pedido: await obtenerPedido(db, id) };
}

async function sinDisponibilidad(db, items) {
  const faltan = [];
  for (const it of items) {
    const p = await db.prepare('SELECT * FROM productos WHERE id = ?').bind(it.producto_id).first();
    const v = vistaProducto(p);
    if (!v.disponible || (v.quedan !== null && v.quedan < it.cantidad))
      faltan.push({ producto_id: p.id, nombre: p.nombre, quedan: v.quedan ?? 0 });
  }
  return faltan;
}

// ---------- Leer pedidos ----------

export async function obtenerPedido(db, id) {
  const p = await db.prepare('SELECT * FROM pedidos WHERE id = ?').bind(id).first();
  if (!p) return null;
  const { results } = await db.prepare('SELECT * FROM renglones WHERE pedido_id = ? ORDER BY id').bind(id).all();
  return conEstado(p, results);
}

export function conEstado(p, renglones) {
  const total = renglones.reduce((s, r) => s + r.cantidad, 0);
  const entregadas = renglones.reduce((s, r) => s + r.entregadas, 0);
  let estado = 'recibido';
  if (p.anulado_en) estado = 'anulado';
  else if (entregadas === total) estado = 'servido';
  else if (entregadas > 0) estado = 'parcial';
  return { ...p, estado, renglones };
}

export async function pedidosDeJornada(db, jornadaId) {
  const { results: ps } = await db
    .prepare('SELECT * FROM pedidos WHERE jornada_id = ? ORDER BY creado_en').bind(jornadaId).all();
  const { results: rs } = await db
    .prepare('SELECT r.* FROM renglones r JOIN pedidos p ON p.id = r.pedido_id WHERE p.jornada_id = ? ORDER BY r.id')
    .bind(jornadaId).all();
  return ps.map((p) => conEstado(p, rs.filter((r) => r.pedido_id === p.id)));
}

// ---------- Entregas ----------

/** Fija cuántas unidades del renglón están entregadas (valor absoluto: repetirlo no duplica). */
export async function fijarEntregadas(db, renglonId, n) {
  if (!Number.isInteger(n) || n < 0) throw new ErrorPedido('cantidad_invalida');
  const r = await db
    .prepare(`UPDATE renglones SET entregadas = ? WHERE id = ? AND ? <= cantidad
              AND pedido_id IN (SELECT id FROM pedidos WHERE anulado_en IS NULL)`)
    .bind(n, renglonId, n).run();
  if (!r.meta.changes) throw new ErrorPedido('no_se_pudo');
}

/** Entrega todo lo pendiente del pedido. */
export async function entregarTodo(db, pedidoId) {
  await db.prepare(
    `UPDATE renglones SET entregadas = cantidad WHERE pedido_id = ?
     AND pedido_id IN (SELECT id FROM pedidos WHERE anulado_en IS NULL)`).bind(pedidoId).run();
}

/** Anula el pedido: devuelve al stock lo que no se entregó. Repetirlo no devuelve dos veces. */
export async function anularPedido(db, pedidoId) {
  const t = ahora();
  await db.batch([
    db.prepare(
      `INSERT INTO movimientos_stock (producto_id, delta, motivo, pedido_id, creado_en)
       SELECT r.producto_id, SUM(r.cantidad - r.entregadas), 'anulacion', ?, ?
       FROM renglones r JOIN productos pr ON pr.id = r.producto_id
       WHERE r.pedido_id = ? AND pr.control = 'cantidad' AND pr.modo = 'auto'
         AND EXISTS (SELECT 1 FROM pedidos WHERE id = ? AND anulado_en IS NULL)
       GROUP BY r.producto_id HAVING SUM(r.cantidad - r.entregadas) > 0`,
    ).bind(pedidoId, t, pedidoId, pedidoId),
    db.prepare(
      `UPDATE productos SET stock = stock + COALESCE((
         SELECT SUM(r.cantidad - r.entregadas) FROM renglones r WHERE r.pedido_id = ? AND r.producto_id = productos.id), 0)
       WHERE control = 'cantidad' AND modo = 'auto'
         AND EXISTS (SELECT 1 FROM pedidos WHERE id = ? AND anulado_en IS NULL)
         AND id IN (SELECT producto_id FROM renglones WHERE pedido_id = ?)`,
    ).bind(pedidoId, pedidoId, pedidoId),
    db.prepare('UPDATE pedidos SET anulado_en = ? WHERE id = ? AND anulado_en IS NULL').bind(t, pedidoId),
  ]);
}

// ---------- Cuentas ----------

/** La cuenta suma SOLO lo entregado. Lo pendiente se informa aparte y no se cobra. */
export async function cuentaDeMesa(db, jornadaId, mesa) {
  const { results } = await db
    .prepare(`SELECT r.nombre, r.precio, SUM(r.entregadas) AS entregadas, SUM(r.cantidad - r.entregadas) AS pendientes
              FROM renglones r JOIN pedidos p ON p.id = r.pedido_id
              WHERE p.jornada_id = ? AND p.mesa = ? AND (p.anulado_en IS NULL OR r.entregadas > 0)
              GROUP BY r.producto_id, r.precio ORDER BY r.nombre`)
    .bind(jornadaId, mesa).all();
  const lineas = results.map((l) => ({
    ...l,
    pendientes: 0 + l.pendientes,
  }));
  // Las unidades pendientes de pedidos anulados no cuentan como pendientes.
  const { results: pend } = await db
    .prepare(`SELECT COALESCE(SUM(r.cantidad - r.entregadas),0) AS n FROM renglones r JOIN pedidos p ON p.id = r.pedido_id
              WHERE p.jornada_id = ? AND p.mesa = ? AND p.anulado_en IS NULL`).bind(jornadaId, mesa).all();
  const total = lineas.reduce((s, l) => s + l.entregadas * l.precio, 0);
  const c = await db.prepare('SELECT * FROM cuentas WHERE jornada_id = ? AND mesa = ?').bind(jornadaId, mesa).first();
  return { mesa, lineas, total, pendientes: pend[0].n, pagada_en: c?.pagada_en ?? null, medio: c?.medio ?? null };
}

export async function pagarCuenta(db, jornadaId, mesa, medio) {
  await db.prepare(
    `INSERT INTO cuentas (jornada_id, mesa, pagada_en, medio) VALUES (?,?,?,?)
     ON CONFLICT (jornada_id, mesa) DO UPDATE SET pagada_en = COALESCE(pagada_en, excluded.pagada_en),
       medio = COALESCE(medio, excluded.medio)`).bind(jornadaId, mesa, ahora(), medio ?? null).run();
  return cuentaDeMesa(db, jornadaId, mesa);
}

// ---------- Stock (panel) ----------

/** Carga/ajuste de stock: fija el valor y deja registro de la diferencia. */
export async function fijarStock(db, productoId, nuevo, motivo = 'ajuste') {
  if (!Number.isInteger(nuevo) || nuevo < 0) throw new ErrorPedido('cantidad_invalida');
  const p = await db.prepare('SELECT stock FROM productos WHERE id = ?').bind(productoId).first();
  if (!p) throw new ErrorPedido('producto_inexistente');
  await db.batch([
    db.prepare('INSERT INTO movimientos_stock (producto_id, delta, motivo, creado_en) VALUES (?,?,?,?)')
      .bind(productoId, nuevo - p.stock, motivo, ahora()),
    db.prepare('UPDATE productos SET stock = ? WHERE id = ?').bind(nuevo, productoId),
  ]);
}
