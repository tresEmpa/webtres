/**
 * Tarjeta de una función. La usan el listado /reservas/ y las páginas
 * perennes /reservas/jueves/ y /reservas/viernes/, así que vive acá y no
 * duplicada en cada template.
 *
 * Ojo: la tarjeta entera es un <a>, así que nada de adentro puede ser otro
 * <a> — anidar enlaces es HTML inválido y el navegador lo desarma solo.
 */
import { esc, GOOGLE, estrellaSVG } from './layout.mjs';
import { fechaHumana, ucfirst } from '../lib/eventos.mjs';

/** Refuerzo de prueba social, en el momento exacto de la duda. */
const MICRO_GOOGLE = `
        <span class="evento-card__gmaps">
          <span class="gmaps-estrellas">${estrellaSVG(13)}</span>
          <span class="evento-card__gmaps-nota">${GOOGLE.nota}</span>
          <span>· ${GOOGLE.opiniones} opiniones en Google</span>
        </span>`;

/**
 * Placa fija por día de semana. A propósito NO usamos ev.flyer: el flyer real
 * es una pieza cuadrada de Instagram y a este tamaño no se lee el nombre del
 * show. Estas dos placas son tipográficas y se leen chiquitas.
 * Un día distinto (un especial de sábado) simplemente va sin placa.
 */
const PLACAS = {
  jueves:  { img: 'placa-jueves-rotativo',  alt: 'El Rotativo Platense' },
  viernes: { img: 'placa-viernes-sociedad', alt: 'Sociedad Platense de Stand Up' },
};

export function eventoCard(ev, now = new Date()) {
  const id = esc(ev.id);
  const color = ev.color || (ev.dia_semana === 'viernes' ? 'rojo' : 'violeta');
  const estado = ev.estado || 'activo';
  const agotado = estado === 'agotado';
  const programado = estado === 'programado';

  let clases = `evento-card evento-card--${esc(color)}`;
  if (agotado) clases += ' evento-card--agotado';
  if (programado) clases += ' evento-card--programado';

  const elenco = (ev.elenco && ev.elenco.length)
    ? `<p class="evento-card__elenco">${esc(ev.elenco.join(' · '))}</p>` : '';

  const cta = agotado
    ? 'Agotado'
    : programado ? 'Próximamente — ver más →' : 'Ver y reservar →';

  const placa = PLACAS[ev.dia_semana];
  const imgPlaca = placa
    ? `<img class="evento-card__placa" src="/assets/img/${placa.img}.webp"
             alt="${esc(placa.alt)}" width="216" height="272"
             loading="lazy" decoding="async">`
    : '';

  return `
      <a class="${clases}${placa ? ' evento-card--con-placa' : ''}" href="/reservas/${id}/">
        <span class="evento-card__dia-badge">
          ${esc(ucfirst(ev.dia_semana))} · ${esc(ev.hora)}hs
        </span>
        <div class="evento-card__cuerpo">
          ${imgPlaca}
          <div class="evento-card__texto">
            <h2 class="evento-card__titulo">${esc(ev.nombre_show)}</h2>
            <p class="evento-card__fecha">${esc(fechaHumana(ev.fecha, false, now))}</p>
            ${elenco}
          </div>
        </div>
        <span class="evento-card__cta">${cta}</span>
${MICRO_GOOGLE}
      </a>`;
}
