/**
 * verificar-eventos.mjs — Comprueba que los cinco eventos de medición se
 * disparen una sola vez y con los parámetros correctos.
 *
 * Reemplaza fbq y gtag por grabadores antes de que cargue la página, así que no
 * hace falta salir a internet ni mirar el Meta Pixel Helper para saber si el
 * cableado está bien. El Pixel Helper sigue siendo la prueba final en producción.
 *
 * Uso:
 *   TEP_BUILD_NOW=2026-08-19 node build.mjs
 *   node tools/verificar-eventos.mjs
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 8789;

const FUNCION = '2026-08-20-el-rotativo-platense';
const FECHA_FUNCION = '2026-08-20';
const FECHA_SIN_FUNCION = '2026-08-19';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  fs.readFile(path.join(DIST, p), (err, buf) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT);

function instanteAR(fecha, hora, minuto) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d, hora + 3, minuto, 0));
}

const GRABADOR = () => {
  window.__fb = [];
  window.__ga = [];
  window.fbq = function () { window.__fb.push([].slice.call(arguments)); };
  window.fbq.queue = []; window.fbq.loaded = true; window.fbq.version = '2.0';
  window._fbq = window.fbq;
  // gtag se declara con "function gtag()" en el layout, así que pisa cualquier
  // stub. Lo que sí sobrevive es dataLayer: ahí van a parar todos los eventos.
  window.dataLayer = [];
  window.open = function () { return null; };  // que no se abra WhatsApp
};

const browser = await chromium.launch();
let fallos = 0;

function chequear(nombre, ok, detalle) {
  if (ok) { console.log(`  ✓ ${nombre}`); return; }
  fallos++;
  console.log(`  ✖ ${nombre}${detalle ? `\n      ${detalle}` : ''}`);
}

async function abrir(url, fecha, hora, minuto) {
  const ctx = await browser.newContext({ timezoneId: 'America/Argentina/Buenos_Aires', locale: 'es-AR' });
  await ctx.clock.setFixedTime(instanteAR(fecha, hora, minuto));
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.addInitScript(GRABADOR);
  await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'domcontentloaded' });
  return { ctx, page };
}

/** Eventos fbq de tipo track con ese nombre. */
const track = (fb, nombre) => fb.filter((a) => a[0] === 'track' && a[1] === nombre);
const evGa = (ga, nombre) => ga.filter((a) => a[0] === 'event' && a[1] === nombre);

// ── 1) Página de función en estado normal ────────────────────────────────
{
  const { ctx, page } = await abrir(`/reservas/${FUNCION}/`, FECHA_SIN_FUNCION, 15, 0);
  let fb = await page.evaluate(() => window.__fb);
  let ga = await page.evaluate(() => window.dataLayer.map((a) => Array.from(a)));

  const vc = track(fb, 'ViewContent');
  chequear('ViewContent se dispara una sola vez al cargar la función',
    vc.length === 1, `se dispararon ${vc.length}`);
  chequear('ViewContent lleva content_name y content_category="funcion"',
    vc[0] && vc[0][2] && vc[0][2].content_name === 'El Rotativo Platense' && vc[0][2].content_category === 'funcion',
    JSON.stringify(vc[0] && vc[0][2]));
  chequear('ViewContent lleva eventID único',
    vc[0] && vc[0][3] && /^[0-9a-f-]{36}$/i.test(vc[0][3].eventID), JSON.stringify(vc[0] && vc[0][3]));
  chequear('GA4 recibe view_item', evGa(ga, 'view_item').length === 1);

  // Primer foco → InitiateCheckout. Segundo y tercer foco → nada más.
  await page.click('#nombre');
  await page.click('#personas');
  await page.click('#mensaje');
  fb = await page.evaluate(() => window.__fb);
  ga = await page.evaluate(() => window.dataLayer.map((a) => Array.from(a)));
  const ic = track(fb, 'InitiateCheckout');
  chequear('InitiateCheckout se dispara una sola vez aunque toque varios campos',
    ic.length === 1, `se dispararon ${ic.length}`);
  chequear('GA4 recibe begin_checkout una vez', evGa(ga, 'begin_checkout').length === 1);

  // Envío del formulario.
  await page.fill('#nombre', 'Prueba');
  await page.fill('#personas', '3');
  await page.check('#acepta');
  await page.click('.reserva-form__submit');
  await page.waitForTimeout(400);
  fb = await page.evaluate(() => window.__fb);
  ga = await page.evaluate(() => window.dataLayer.map((a) => Array.from(a)));
  const lead = track(fb, 'Lead');
  chequear('Lead se dispara una sola vez al enviar el formulario',
    lead.length === 1, `se dispararon ${lead.length}`);
  chequear('Lead lleva content_category="reserva_web" y num_items=3',
    lead[0] && lead[0][2].content_category === 'reserva_web' && lead[0][2].num_items === 3,
    JSON.stringify(lead[0] && lead[0][2]));
  chequear('Lead NO lleva el nombre de quien reserva',
    lead[0] && !JSON.stringify(lead[0][2]).includes('Prueba'), JSON.stringify(lead[0] && lead[0][2]));
  chequear('GA4 recibe generate_lead', evGa(ga, 'generate_lead').length === 1);
  chequear('Sigue la conversión de Google Ads que ya existía',
    ga.some((a) => a[0] === 'event' && a[1] === 'conversion'));

  await ctx.close();
}

// ── 2) Página de función sobre la hora ───────────────────────────────────
{
  const { ctx, page } = await abrir(`/reservas/${FUNCION}/`, FECHA_FUNCION, 20, 30);
  await page.click('#tep-wsp-ultima-hora');
  await page.waitForTimeout(300);
  const fb = await page.evaluate(() => window.__fb);
  const ga = await page.evaluate(() => window.dataLayer.map((a) => Array.from(a)));
  const lead = track(fb, 'Lead');
  chequear('Consultar por WhatsApp sobre la hora dispara Lead una vez',
    lead.length === 1, `se dispararon ${lead.length}`);
  chequear('Ese Lead lleva content_category="reserva_ultima_hora"',
    lead[0] && lead[0][2].content_category === 'reserva_ultima_hora', JSON.stringify(lead[0] && lead[0][2]));
  chequear('GA4 recibe generate_lead sobre la hora', evGa(ga, 'generate_lead').length === 1);
  await ctx.close();
}

// ── 3) Botón flotante de WhatsApp, en varias páginas ─────────────────────
for (const url of ['/', '/reservas/', `/reservas/${FUNCION}/`, '/cursos/']) {
  const { ctx, page } = await abrir(url, FECHA_SIN_FUNCION, 15, 0);
  await page.click('.whatsapp-float');
  await page.waitForTimeout(300);
  const fb = await page.evaluate(() => window.__fb);
  const ga = await page.evaluate(() => window.dataLayer.map((a) => Array.from(a)));
  const contact = track(fb, 'Contact');
  chequear(`Botón flotante dispara Contact en ${url}`,
    contact.length === 1 && contact[0][2].content_category === 'wsp_flotante',
    JSON.stringify(contact.map((c) => c[2])));
  chequear(`GA4 recibe contact en ${url}`, evGa(ga, 'contact').length === 1);
  await ctx.close();
}

await browser.close();
server.close();

console.log(fallos ? `\n✖ ${fallos} comprobación(es) fallaron.` : '\n✔ Todos los eventos disparan como corresponde.');
process.exit(fallos ? 1 : 0);
