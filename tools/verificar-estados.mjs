/**
 * verificar-estados.mjs — Prueba los cuatro estados de la noche en un navegador
 * real, con el reloj y la zona horaria forzados.
 *
 * Uso:
 *   TEP_BUILD_NOW=2026-08-19 node build.mjs
 *   node tools/verificar-estados.mjs
 *
 * Requiere playwright (npm i -D playwright). No corre en el build ni en el
 * deploy: es una herramienta de mano.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 8788;

// La función que usamos de conejillo de indias (jueves).
const FUNCION = '2026-08-20-el-rotativo-platense';
const FECHA_FUNCION = '2026-08-20';
const FECHA_SIN_FUNCION = '2026-08-19';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml',
};

function servir() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const full = path.join(DIST, p);
    fs.readFile(full, (err, buf) => {
      if (err) { res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
      res.end(buf);
    });
  }).listen(PORT);
}

/** Instante UTC que corresponde a una hora de Argentina (UTC-3 fijo). */
function instanteAR(fecha, hora, minuto) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d, hora + 3, minuto, 0));
}

const casos = [
  // [descripción, url, fecha AR, hora, minuto, zona del dispositivo, estado esperado, form visible]
  ['Día de función 19:59 → todavía se reserva',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 19, 59, 'America/Argentina/Buenos_Aires', 'NORMAL', true],
  ['Día de función 20:01 → sobre la hora, WhatsApp',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 20, 1, 'America/Argentina/Buenos_Aires', 'ULTIMA_HORA', false],
  ['Día de función 21:59 → sigue sobre la hora',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 21, 59, 'America/Argentina/Buenos_Aires', 'ULTIMA_HORA', false],
  ['Día de función 22:01 → cerrado',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 22, 1, 'America/Argentina/Buenos_Aires', 'CERRADO', false],
  ['Día de función 23:59 → sigue cerrado',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 23, 59, 'America/Argentina/Buenos_Aires', 'CERRADO', false],
  ['Día de función 00:01 → arranca el día, se reserva',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 0, 1, 'America/Argentina/Buenos_Aires', 'NORMAL', true],
  ['Día sin función 21:00 → se reserva igual',
    `/reservas/${FUNCION}/`, FECHA_SIN_FUNCION, 21, 0, 'America/Argentina/Buenos_Aires', 'SIN_FUNCION', true],
  ['Día sin función 03:00 → se reserva igual',
    `/reservas/${FUNCION}/`, FECHA_SIN_FUNCION, 3, 0, 'America/Argentina/Buenos_Aires', 'SIN_FUNCION', true],

  // Mismo instante real, relojes de otros países. El estado no debe moverse.
  ['21:00 AR visto desde Madrid (allá son las 2 AM del día siguiente)',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 21, 0, 'Europe/Madrid', 'ULTIMA_HORA', false],
  ['21:00 AR visto desde Tokio (allá son las 9 AM del día siguiente)',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 21, 0, 'Asia/Tokyo', 'ULTIMA_HORA', false],
  ['21:00 AR visto desde Los Ángeles (allá son las 5 PM del mismo día)',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 21, 0, 'America/Los_Angeles', 'ULTIMA_HORA', false],
  ['19:00 AR visto desde Madrid → todavía se reserva',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 19, 0, 'Europe/Madrid', 'NORMAL', true],
  ['00:30 AR del día de función visto desde Tokio → se reserva',
    `/reservas/${FUNCION}/`, FECHA_FUNCION, 0, 30, 'Asia/Tokyo', 'NORMAL', true],

  // Listado.
  ['Listado, día de función 20:30', '/reservas/', FECHA_FUNCION, 20, 30,
    'America/Argentina/Buenos_Aires', 'ULTIMA_HORA', null],
  ['Listado, día de función 22:30', '/reservas/', FECHA_FUNCION, 22, 30,
    'America/Argentina/Buenos_Aires', 'CERRADO', null],
  ['Listado, día sin función 21:00', '/reservas/', FECHA_SIN_FUNCION, 21, 0,
    'America/Argentina/Buenos_Aires', 'SIN_FUNCION', null],
];

const server = servir();
const browser = await chromium.launch();
let fallos = 0;

for (const [nombre, url, fecha, hora, minuto, zona, esperado, formVisible] of casos) {
  const ctx = await browser.newContext({ timezoneId: zona, locale: 'es-AR' });
  // Sólo se falsea el reloj, no los timers: la página tiene que cargar normal.
  await ctx.clock.setFixedTime(instanteAR(fecha, hora, minuto));
  // El sandbox no sale a internet: cortamos pixel, gtag y fuentes.
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const page = await ctx.newPage();

  // Detecta parpadeo: mira si el formulario llegó a pintarse alguna vez.
  await page.addInitScript(() => {
    window.__vioForm = false;
    const mirar = () => {
      const f = document.getElementById('reserva-form');
      if (f && f.offsetParent !== null) window.__vioForm = true;
      if (document.readyState !== 'interactive' && document.readyState !== 'complete') requestAnimationFrame(mirar);
    };
    requestAnimationFrame(mirar);
  });

  await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'domcontentloaded' });

  const estado = await page.evaluate(() => document.documentElement.getAttribute('data-tep-noche'));
  const visible = await page.evaluate(() => {
    const vis = (sel) => { const e = document.querySelector(sel); return !!(e && e.offsetParent !== null); };
    return {
      form: vis('#reserva-form'),
      ultimaHora: vis('.tep-ultima-hora'),
      cerrado: vis('.tep-cerrado'),
      parpadeo: window.__vioForm,
    };
  });

  const errores = [];
  if (estado !== esperado) errores.push(`estado ${estado} ≠ ${esperado}`);
  if (formVisible !== null && visible.form !== formVisible) {
    errores.push(`formulario ${visible.form ? 'visible' : 'oculto'}, se esperaba ${formVisible ? 'visible' : 'oculto'}`);
  }
  if (esperado === 'ULTIMA_HORA' && !visible.ultimaHora) errores.push('falta el bloque de WhatsApp');
  if (esperado === 'CERRADO' && !visible.cerrado) errores.push('falta el bloque "ya cerramos"');
  if (formVisible === false && visible.parpadeo) errores.push('PARPADEO: el formulario se vio un instante');

  if (errores.length) { fallos++; console.log(`  ✖ ${nombre}\n      ${errores.join('\n      ')}`); }
  else console.log(`  ✓ ${nombre}  [${estado}]`);

  await ctx.close();
}

await browser.close();
server.close();

console.log(fallos ? `\n✖ ${fallos} caso(s) fallaron.` : `\n✔ Los ${casos.length} casos pasaron.`);
process.exit(fallos ? 1 : 0);
