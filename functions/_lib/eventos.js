/**
 * Capa de eventos — port de cocina/lib/eventos.php a JavaScript.
 *
 * Cada evento es un archivo JSON en /data/eventos/YYYY-MM-DD-slug.json.
 * Estas funciones se usan tanto en el build estático (Node) como, en versión
 * espejo, dentro de las Cloudflare Functions del admin.
 *
 * Fechas: se parsean como YYYY-MM-DD en UTC para que el día de la semana y el
 * formato humano sean deterministas y no dependan del timezone del servidor.
 */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Devuelve un Date en UTC a partir de 'YYYY-MM-DD' (medianoche UTC). */
function parseFecha(fechaIso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaIso || '');
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

/** 'YYYY-MM-DD' de hoy (según la zona horaria de Argentina, UTC-3). */
export function hoyISO(now = new Date()) {
  // Argentina = UTC-3 fijo (sin horario de verano desde 2009)
  const ar = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return ar.toISOString().slice(0, 10);
}

/** Día de la semana en castellano (0 = domingo). */
export function diaSemana(fechaIso) {
  const d = parseFecha(fechaIso);
  return d ? DIAS[d.getUTCDay()] : '';
}

/** Formatea 'YYYY-MM-DD' a "viernes 15 de mayo" (+ año si no es el actual). */
export function fechaHumana(fechaIso, incluirAnio = false, now = new Date()) {
  const d = parseFecha(fechaIso);
  if (!d) return fechaIso;
  const dia = DIAS[d.getUTCDay()];
  const num = d.getUTCDate();
  const mes = MESES[d.getUTCMonth() + 1];
  let out = `${dia} ${num} de ${mes}`;
  const anioActual = hoyISO(now).slice(0, 4);
  if (incluirAnio || String(d.getUTCFullYear()) !== anioActual) {
    out += ` de ${d.getUTCFullYear()}`;
  }
  return out;
}

/** Slug URL-friendly: minúsculas, sin acentos, con guiones. */
export function slug(texto) {
  const reemplazos = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ü': 'u',
    'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u', 'Ñ': 'n'
  };
  return (texto || '')
    .trim()
    .toLowerCase()
    .replace(/[áéíóúñüÁÉÍÓÚÑ]/g, (c) => reemplazos[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'evento';
}

/** ID del evento a partir de fecha y nombre. */
export function eventoId(fecha, nombre) {
  return `${fecha}-${slug(nombre)}`;
}

/**
 * Normaliza/completa un objeto evento con los mismos defaults que el PHP.
 * No escribe nada; devuelve el objeto listo para guardar o renderizar.
 */
export function normalizarEvento(data) {
  const ev = { ...data };
  const d = parseFecha(ev.fecha);
  if (d) ev.fecha = d.toISOString().slice(0, 10);
  ev.dia_semana = diaSemana(ev.fecha);
  ev.hora = ev.hora || '21:30';
  ev.duracion_minutos = parseInt(ev.duracion_minutos ?? 90, 10) || 90;
  ev.estado = ev.estado || 'activo';
  ev.elenco = Array.isArray(ev.elenco) ? ev.elenco.map((x) => String(x).trim()).filter(Boolean) : [];
  ev.descripcion = ev.descripcion || '';
  ev.flyer = ev.flyer || '';
  ev.link_instagram = ev.link_instagram || '';
  ev.notas_internas = ev.notas_internas || '';
  ev.plantilla = ev.plantilla || '';
  ev.motivo_cancelacion = ev.motivo_cancelacion || '';
  ev.color = ev.color || (ev.dia_semana === 'viernes' ? 'rojo' : 'violeta');
  ev.id = eventoId(ev.fecha, ev.nombre_show);
  return ev;
}

/**
 * Ordena y filtra una lista de eventos ya cargados.
 * opts: { desde, hasta, estados[], orden 'asc'|'desc', incluirPasados, now }
 */
export function listarEventos(eventos, opts = {}) {
  const {
    desde = null, hasta = null, estados = null,
    orden = 'asc', incluirPasados = false, now = new Date(),
  } = opts;
  const hoy = hoyISO(now);

  let out = eventos.filter((ev) => {
    if (!ev || !ev.fecha) return false;
    if (!incluirPasados && ev.fecha < hoy) return false;
    if (desde && ev.fecha < desde) return false;
    if (hasta && ev.fecha > hasta) return false;
    if (estados && !estados.includes(ev.estado || 'activo')) return false;
    return true;
  });

  out.sort((a, b) => {
    const ka = `${a.fecha || ''} ${a.hora || '00:00'}`;
    const kb = `${b.fecha || ''} ${b.hora || '00:00'}`;
    const cmp = ka < kb ? -1 : ka > kb ? 1 : 0;
    return orden === 'desc' ? -cmp : cmp;
  });

  return out;
}

/** Próximo evento (activo/agotado) de un día de la semana dado. */
export function proximoPorDia(eventos, dia, now = new Date()) {
  const lista = listarEventos(eventos, { estados: ['activo', 'agotado'], orden: 'asc', now });
  return lista.find((ev) => (ev.dia_semana || '') === dia) || null;
}

/** startDate / endDate ISO 8601 con offset -03:00 para el Schema Event. */
export function eventoFechasISO(ev) {
  const fecha = ev.fecha;
  const hora = ev.hora || '21:30';
  const dur = parseInt(ev.duracion_minutos ?? 90, 10) || 90;
  if (!fecha) return [null, null];
  const m = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!m) return [null, null];
  // Trabajamos en "hora local Argentina" sumando el offset a mano.
  const base = parseFecha(fecha);
  base.setUTCHours(+m[1], +m[2], 0, 0);
  const end = new Date(base.getTime() + dur * 60000);
  const fmt = (d) => d.toISOString().slice(0, 19); // sin Z
  return [`${fmt(base)}-03:00`, `${fmt(end)}-03:00`];
}

/** Mapea estado interno a [eventStatus, availability] de Schema.org. */
export function eventoSchemaEstado(estado) {
  switch (estado) {
    case 'cancelado':
      return ['https://schema.org/EventCancelled', 'https://schema.org/SoldOut'];
    case 'agotado':
      return ['https://schema.org/EventScheduled', 'https://schema.org/SoldOut'];
    default:
      return ['https://schema.org/EventScheduled', 'https://schema.org/InStock'];
  }
}

/** ucfirst equivalente. */
export function ucfirst(s) {
  s = String(s || '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
