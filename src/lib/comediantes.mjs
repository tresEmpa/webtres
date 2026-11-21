/**
 * Comediantes con página propia (data/comediantes.json) y su cruce con los
 * eventos. El elenco de cada función se carga a mano en el panel y viene
 * sucio ("Con Rubén Vaena y Ema Chanta.", "Checho Falco (MC)", "Ruben" sin
 * tilde), así que el cruce es por nombre normalizado contenido en el texto.
 */
import { enArchivo, hoyISO } from './eventos.mjs';

export function normalizar(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

/** ¿Este evento tiene en el elenco a este comediante? */
export function actuaEn(com, ev) {
  const items = (ev.elenco || []).map(normalizar);
  const claves = (com.alias && com.alias.length ? com.alias : [com.nombre]).map(normalizar);
  // Basta con el nombre: "checho falco (mc)" contiene "checho falco".
  const nombre = normalizar(com.nombre);
  return items.some((it) => it.includes(nombre) || claves.some((c) => it.includes(c)));
}

/**
 * Para cada comediante: próximas funciones (no canceladas) y las del último
 * año, más reciente primero. Mismo criterio de "último año" que el archivo.
 */
export function cruzar(comediantes, eventos, now = new Date()) {
  const hoy = hoyISO(now);
  const orden = (a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0);
  return comediantes.map((com) => {
    const suyas = eventos.filter((ev) => ev && ev.fecha && actuaEn(com, ev));
    const proximas = suyas
      .filter((ev) => ev.fecha >= hoy && (ev.estado || 'activo') !== 'cancelado')
      .sort(orden);
    const pasadas = suyas.filter((ev) => enArchivo(ev, now)).sort(orden).reverse();
    return { ...com, proximas, pasadas };
  });
}

/** Mapa nombre normalizado → slug, para enlazar el elenco de cada función. */
export function indiceNombres(comediantes) {
  const m = new Map();
  for (const c of comediantes) {
    for (const a of [c.nombre, ...(c.alias || [])]) m.set(normalizar(a), c.slug);
  }
  return m;
}

const VARIANTES = { a: 'aáà', e: 'eéè', i: 'iíì', o: 'oóò', u: 'uúüù', n: 'nñ' };
function patron(nombre) {
  return normalizar(nombre).split('').map((ch) => {
    if (VARIANTES[ch]) return `[${VARIANTES[ch]}${VARIANTES[ch].toUpperCase()}]`;
    if (/\s/.test(ch)) return '\\s+';
    return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('');
}

/**
 * Devuelve el texto de un ítem del elenco escapado, con cada nombre de
 * comediante convertido en enlace a su página. "Con Rubén Vaena y Ema
 * Chanta." queda con dos enlaces y el resto del texto intacto.
 */
export function enlazarElenco(texto, comediantes, esc) {
  const t = String(texto || '');
  const hits = [];
  for (const c of comediantes) {
    const re = new RegExp(patron(c.nombre), 'gi');
    let m;
    while ((m = re.exec(t))) hits.push({ i: m.index, len: m[0].length, slug: c.slug });
  }
  hits.sort((a, b) => a.i - b.i);
  let out = ''; let pos = 0;
  for (const h of hits) {
    if (h.i < pos) continue;
    out += esc(t.slice(pos, h.i))
      + `<a href="/comediantes/${esc(h.slug)}/">${esc(t.slice(h.i, h.i + h.len))}</a>`;
    pos = h.i + h.len;
  }
  return out + esc(t.slice(pos));
}
