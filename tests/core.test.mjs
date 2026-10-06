import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Miniflare } from 'miniflare';
import * as core from '../functions/_pedidos/core.js';

let db, mf;
const sql = (f) => readFileSync(new URL(`../migrations/${f}`, import.meta.url), 'utf8');

before(async () => {
  mf = new Miniflare({
    modules: true, script: 'export default { fetch() { return new Response("") } }', d1Databases: ['DB'],
  });
  db = await mf.getD1Database('DB');
  for (const f of ['0001_init.sql', '0002_seed.sql']) {
    const limpio = sql(f).split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
    for (const st of limpio.split(/;\s*\n/).map((x) => x.trim()).filter(Boolean)) await db.prepare(st).run();
  }
  await core.abrirJornada(db);
  await core.fijarStock(db, 'empanada-bondiola', 5, 'carga');
});

after(async () => { await mf.dispose(); });

const pedir = (mesa, producto_id, cantidad, id = randomUUID()) =>
  core.crearPedido(db, { id, mesa, items: [{ producto_id, cantidad }] });
const stock = async (id) => (await db.prepare('SELECT stock FROM productos WHERE id=?').bind(id).first()).stock;

test('100 pedidos simultáneos por 5 empanadas: se venden exactamente 5', async () => {
  const r = await Promise.allSettled(Array.from({ length: 100 }, (_, i) => pedir('M' + (i % 15), 'empanada-bondiola', 1)));
  const ok = r.filter((x) => x.status === 'fulfilled').length;
  assert.equal(ok, 5);
  assert.equal(await stock('empanada-bondiola'), 0);
  for (const x of r.filter((x) => x.status === 'rejected')) assert.equal(x.reason.codigo, 'sin_stock');
});

test('1000 reintentos del mismo id crean un solo pedido y descuentan una vez', async () => {
  await core.fijarStock(db, 'budweiser-lata', 10, 'carga');
  const id = randomUUID();
  await Promise.all(Array.from({ length: 1000 }, () => pedir('M1', 'budweiser-lata', 2, id).catch((e) => e)));
  const n = await db.prepare('SELECT COUNT(*) n FROM pedidos WHERE id=?').bind(id).first();
  assert.equal(n.n, 1);
  assert.equal(await stock('budweiser-lata'), 8);
});

test('el precio sale de la base, no del cliente', async () => {
  const r = await core.crearPedido(db, { id: randomUUID(), mesa: 'M2', items: [{ producto_id: 'ipa', cantidad: 1, precio: 1 }] });
  assert.equal(r.pedido.renglones[0].precio, 6000);
});

test('tirada sin disponibilidad se rechaza y no deja pedido a medias', async () => {
  await db.prepare("UPDATE productos SET disponible=0 WHERE id='ipa'").run();
  const id = randomUUID();
  await assert.rejects(() => core.crearPedido(db, { id, mesa: 'M3', items: [{ producto_id: 'ipa', cantidad: 1 }, { producto_id: 'agua', cantidad: 1 }] }), { codigo: 'sin_stock' });
  assert.equal(await core.obtenerPedido(db, id), null);
  await db.prepare("UPDATE productos SET disponible=1 WHERE id='ipa'").run();
});

test('modo manual: no descuenta ni bloquea por cantidad', async () => {
  await db.prepare("UPDATE productos SET modo='manual' WHERE id='empanada-calabaza'").run();
  await pedir('M4', 'empanada-calabaza', 6);
  assert.equal(await stock('empanada-calabaza'), 0);
  await db.prepare("UPDATE productos SET modo='auto' WHERE id='empanada-calabaza'").run();
});

test('cuenta suma todo lo pedido (lo anulado no entregado no se cobra)', async () => {
  const j = await core.jornadaAbierta(db);
  await core.fijarStock(db, 'empanada-jamon-queso', 10, 'carga');
  const { pedido } = await core.crearPedido(db, { id: randomUUID(), mesa: 'M5', items: [{ producto_id: 'agua', cantidad: 1 }, { producto_id: 'empanada-jamon-queso', cantidad: 3 }] });
  let c = await core.cuentaDeMesa(db, j.id, 'M5');
  assert.equal(c.total, 3500 + 3 * 3000); assert.equal(c.pendientes, 4);
  await core.fijarEntregadas(db, pedido.renglones[0].id, 1);
  await core.fijarEntregadas(db, pedido.renglones[1].id, 2);
  await core.fijarEntregadas(db, pedido.renglones[1].id, 2); // repetir no duplica
  c = await core.cuentaDeMesa(db, j.id, 'M5');
  assert.equal(c.total, 3500 + 3 * 3000); assert.equal(c.pendientes, 1);
  assert.equal((await core.obtenerPedido(db, pedido.id)).estado, 'parcial');
  await core.entregarTodo(db, pedido.id);
  assert.equal((await core.obtenerPedido(db, pedido.id)).estado, 'servido');
});

test('anular devuelve el stock una sola vez y respeta lo entregado', async () => {
  await core.fijarStock(db, 'papitas', 10, 'carga');
  const { pedido } = await pedir('M6', 'papitas', 4);
  await core.fijarEntregadas(db, pedido.renglones[0].id, 1);
  assert.equal(await stock('papitas'), 6);
  await core.anularPedido(db, pedido.id);
  await core.anularPedido(db, pedido.id);
  assert.equal(await stock('papitas'), 9); // vuelven 3 (las no entregadas)
  const j = await core.jornadaAbierta(db);
  assert.equal((await core.cuentaDeMesa(db, j.id, 'M6')).total, 2500); // lo entregado se cobra
});

test('sin jornada abierta no se puede pedir', async () => {
  await core.cerrarJornada(db);
  await assert.rejects(() => pedir('M7', 'agua', 1), { codigo: 'cerrado' });
  await core.abrirJornada(db);
});
