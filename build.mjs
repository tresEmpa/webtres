/**
 * build.mjs — Generador estático de Tres Empanadas Comedia.
 *
 * Lee los datos de /data (eventos, lugar) y produce /dist con todo el sitio
 * en HTML estático, listo para Cloudflare Pages. No usa PHP ni dependencias.
 *
 * Uso:  node build.mjs
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { listarEventos, fechaHumana } from './src/lib/eventos.mjs';
import { renderHome } from './src/templates/home.mjs';
import { renderReservasList } from './src/templates/reservas-list.mjs';
import { renderEvento } from './src/templates/evento.mjs';
import { renderDia } from './src/templates/dia.mjs';
import { renderCursos } from './src/templates/cursos.mjs';
import { renderStandupLaPlata } from './src/templates/standup-la-plata.mjs';
import { renderNotFound } from './src/templates/not-found.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const DATA = path.join(ROOT, 'data');
const STATIC = path.join(ROOT, 'static');

// Permite fijar la "fecha de hoy" para previsualizar (ej: TEP_BUILD_NOW=2026-05-13).
// En producción se deja vacío y usa el reloj real.
const NOW = process.env.TEP_BUILD_NOW ? new Date(`${process.env.TEP_BUILD_NOW}T12:00:00Z`) : new Date();
const YEAR = NOW.getFullYear();

async function rmrf(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

async function writeFile(rel, contents) {
  const full = path.join(DIST, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, contents);
}

async function loadEventos() {
  const dir = path.join(DATA, 'eventos');
  let files = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  const out = [];
  for (const f of files) {
    try {
      const raw = await fs.readFile(path.join(dir, f), 'utf8');
      const data = JSON.parse(raw);
      if (!data || !data.fecha) continue;
      data.id = f.replace(/\.json$/, ''); // id = nombre de archivo (como el PHP)
      out.push(data);
    } catch (err) {
      console.warn(`  ⚠ Evento ilegible, se omite: ${f} (${err.message})`);
    }
  }
  return out;
}

/**
 * Alto y ancho de un PNG o JPEG, leídos del encabezado del archivo.
 *
 * Sirve para poner width/height en el <img> del flyer: sin eso el navegador no
 * sabe cuánto espacio reservar y el contenido salta cuando la imagen carga.
 * Se lee acá y no se instala nada — los encabezados son cuatro bytes.
 */
function dimensionesImagen(buf) {
  // PNG: ancho y alto van fijos en el chunk IHDR.
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  // JPEG: hay que caminar los segmentos hasta un SOF.
  if (buf.length > 4 && buf[0] === 0xFF && buf[1] === 0xD8) {
    let o = 2;
    while (o + 9 < buf.length) {
      if (buf[o] !== 0xFF) { o++; continue; }
      const marca = buf[o + 1];
      const esSOF = marca >= 0xC0 && marca <= 0xCF
        && marca !== 0xC4 && marca !== 0xC8 && marca !== 0xCC;
      if (esSOF) return { w: buf.readUInt16BE(o + 7), h: buf.readUInt16BE(o + 5) };
      const largo = buf.readUInt16BE(o + 2);
      if (largo < 2) break;
      o += 2 + largo;
    }
  }
  return null;
}

/** Le pega a cada evento el tamaño real de su flyer, si lo tiene. */
async function medirFlyers(eventos) {
  let pesados = 0;
  for (const ev of eventos) {
    if (!ev.flyer) continue;
    try {
      const buf = await fs.readFile(path.join(DATA, 'flyers', ev.flyer));
      const d = dimensionesImagen(buf);
      if (d) { ev.flyer_w = d.w; ev.flyer_h = d.h; }
      if (buf.length > 600 * 1024) {
        pesados++;
        console.warn(`  ⚠ Flyer pesado (${Math.round(buf.length / 1024)} KB): ${ev.flyer}`);
      }
    } catch {
      // El evento declara un flyer que no está en /data/flyers. Antes esto
      // pintaba un <img> roto en la página; ahora simplemente no se muestra.
      console.warn(`  ⚠ Flyer inexistente, la función va sin imagen: ${ev.flyer} (${ev.id})`);
      ev.flyer = '';
    }
  }
  if (pesados) {
    console.warn(`  ⚠ ${pesados} flyer(s) arriba de 600 KB. Conviene guardarlos como JPG.`);
  }
}

async function loadJSON(rel, fallback) {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA, rel), 'utf8'));
  } catch {
    return fallback;
  }
}

function sitemap(eventosUpcoming) {
  const base = 'https://tresempanadas.com.ar';
  const urls = [
    { loc: `${base}/`, freq: 'weekly', pri: '1.0' },
    { loc: `${base}/reservas/`, freq: 'weekly', pri: '0.9' },
    { loc: `${base}/reservas/viernes/`, freq: 'weekly', pri: '0.9' },
    { loc: `${base}/reservas/jueves/`, freq: 'weekly', pri: '0.9' },
    { loc: `${base}/stand-up-la-plata/`, freq: 'weekly', pri: '0.9' },
    { loc: `${base}/cursos/`, freq: 'monthly', pri: '0.8' },
    { loc: `${base}/carta/`, freq: 'monthly', pri: '0.3' },
  ];
  for (const ev of eventosUpcoming) {
    urls.push({ loc: `${base}/reservas/${ev.id}/`, freq: 'daily', pri: '0.7' });
  }
  const body = urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${body}

</urlset>
`;
}

const REDIRECTS = `# Redirects 301 heredados del .htaccess (URLs viejas de WordPress)
# Cloudflare Pages los aplica automáticamente. Path-only.

/curso-de-standup-clases-y-talleres-2        /cursos/   301
/curso-de-standup-clases-y-talleres          /cursos/   301
/escuela-de-standup                          /cursos/   301
/show-standup-jueves                         /reservas/jueves/   301
/jueves-de-stand-up-con-el-rotativo-platense /reservas/jueves/   301
/sociedad-platense-de-stand-up-show-entradas /reservas/viernes/  301
/shows-jueves-y-o-viernes                     /reservas/  301
/categoria-producto/entradas                 /reservas/  301
/categoria-standup/entradas                  /reservas/  301
/etiqueta-standup/entradas-shows             /reservas/  301
/categoria-standup/cervezas-y-empanadas      /carta/     301
/comedia/pinta-de-cerveza-artesanal-copia    /carta/     301
/libros-de-stand-up-en-espanol               /   301
/contacto-club-de-comedia-tres-empanadas-la-plata  /   301
/nueva        /   301
/sample-page  /   301
/carta/carta-claude.html   /carta/   301
`;

const HEADERS = `# Cabeceras de seguridad (equivalente a los Header set del .htaccess)
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin

# El admin no se indexa
/cocina/*
  X-Robots-Tag: noindex, nofollow, noarchive
  Cache-Control: no-store, no-cache, must-revalidate, private
`;

async function main() {
  console.log('▶ Build Tres Empanadas — generando sitio estático…');
  await rmrf(DIST);
  await fs.mkdir(DIST, { recursive: true });

  // 1) Estáticos verbatim
  await copyDir(STATIC, DIST);

  // 2) Flyers públicos en /data/flyers
  try {
    await copyDir(path.join(DATA, 'flyers'), path.join(DIST, 'data', 'flyers'));
  } catch { /* sin flyers */ }

  // 3) Datos
  const eventos = await loadEventos();
  const lugar = await loadJSON('lugar.json', {});
  await medirFlyers(eventos);
  console.log(`  · ${eventos.length} eventos cargados`);

  // 4) Home
  await writeFile('index.html', renderHome(YEAR));

  // 5) Listado de reservas (próximos, mismos filtros que el PHP)
  const listado = listarEventos(eventos, {
    estados: ['activo', 'programado', 'agotado'],
    orden: 'asc',
    incluirPasados: false,
    now: NOW,
  });
  await writeFile('reservas/index.html', renderReservasList(listado, YEAR));

  // 6) Una página por evento (incluye pasados, para no romper links viejos)
  for (const ev of eventos) {
    await writeFile(`reservas/${ev.id}/index.html`, renderEvento(ev, lugar, YEAR, NOW));
  }

  // 6 bis) Páginas perennes de jueves y viernes.
  // Antes eran un redirect 302 a la función de la semana, así que no tenían
  // página propia y no podían posicionar por su cuenta. Ahora son estáticas, y
  // Cloudflare Pages sirve el archivo antes que la Function, que queda sólo
  // como reserva para cualquier otro segmento.
  for (const dia of ['jueves', 'viernes']) {
    const delDia = listado.filter((ev) => (ev.dia_semana || '').toLowerCase() === dia);
    await writeFile(`reservas/${dia}/index.html`, renderDia(dia, delDia, YEAR, NOW));
  }

  // 7) Cursos
  await writeFile('cursos/index.html', renderCursos(YEAR, lugar));

  // 8) Landing limpia para Google Ads
  await writeFile('stand-up-la-plata/index.html', renderStandupLaPlata(YEAR));

  // 9) 404
  await writeFile('404.html', renderNotFound(YEAR));

  // 10) Sitemap (base + próximos eventos)
  await writeFile('sitemap.xml', sitemap(listado));

  // 11) Agenda para las Functions jueves/viernes (todos los eventos, mínima)
  const agenda = eventos.map((ev) => ({
    id: ev.id,
    fecha: ev.fecha,
    hora: ev.hora || '21:30',
    dia_semana: ev.dia_semana || '',
    estado: ev.estado || 'activo',
    nombre_show: ev.nombre_show || '',
  }));
  await writeFile('data/agenda.json', JSON.stringify(agenda));

  // 12) Cloudflare _redirects y _headers
  await writeFile('_redirects', REDIRECTS);
  await writeFile('_headers', HEADERS);

  console.log(`✔ Build listo en /dist — ${eventos.length} eventos, ${listado.length} próximos.`);
}

main().catch((err) => {
  console.error('✖ Build falló:', err);
  process.exit(1);
});
