/** Listado de funciones — port de reservas/index.php */
import { page, esc } from './layout.mjs';
import { fechaHumana, ucfirst } from '../lib/eventos.mjs';

const SEMAFORO_TOP = `
<div class="horarios-card horarios-card--top">
  <h3>Horarios de la noche</h3>
  <div class="semaforo">
    <div class="semaforo__row semaforo__row--verde">
      <span class="semaforo__dot" aria-hidden="true"></span>
      <span class="semaforo__hora">21:00</span>
      <span class="semaforo__label">Abrimos — vení tempranito</span>
    </div>
    <div class="semaforo__row semaforo__row--amarillo">
      <span class="semaforo__dot" aria-hidden="true"></span>
      <span class="semaforo__hora">21:30</span>
      <span class="semaforo__label">Bien, justito</span>
    </div>
    <div class="semaforo__row semaforo__row--naranja">
      <span class="semaforo__dot" aria-hidden="true"></span>
      <span class="semaforo__hora">21:45</span>
      <span class="semaforo__label">Vencen las reservas</span>
    </div>
    <div class="semaforo__row semaforo__row--rojo">
      <span class="semaforo__dot" aria-hidden="true"></span>
      <span class="semaforo__hora">22:01</span>
      <span class="semaforo__label">No se entra más</span>
    </div>
  </div>
</div>`;

const EXTRA = `
<section class="reservas-extra">
  <h3>Antes de venir</h3>
  <p>
    🎟️ <strong>La reserva es gratuita.</strong> El show es <strong>a la gorra</strong>: aportás lo que puedas al final.
    Aceptamos efectivo, tarjeta, QR y transferencia.
  </p>
  <p>
    🥟 Hay <strong>empanadas, cervezas artesanales tiradas, latas y opciones sin alcohol</strong>.
    <a href="/carta/" target="_blank" rel="noopener">Ver la carta</a>.
  </p>
  <p>
    ⭐ ¿Tenés dudas? Mirá las reseñas en
    <a href="https://share.google/dyTTJVXR25JTlU7kX" target="_blank" rel="noopener">Google Maps</a>.
  </p>

  <h3>Cómo llegar</h3>
  <p>
    Calle 43 N° 1349, esquina 22 — La Plata.
    Es la fachada violeta con las cortinas amarillas, no tiene pérdida.
  </p>

  <h3>Más info</h3>
  <p>🎭 Somos un <strong>microteatro</strong>, no un resto ni un bar gigante.</p>
  <p>✋ Se puede ver el show sin consumir.</p>
  <p>🌾 No tenemos menú sin TACC, pero podés traer tu propia comida.</p>
  <p>🔞 El humor y el ambiente son <strong>para adultos</strong>.</p>
  <p>
    🎂 ¿Querés festejar con tu grupo?
    <a href="https://wa.me/542215247488?text=Hola%21%20Consulta%20por%20festejos" target="_blank" rel="noopener">Escribinos por WhatsApp</a>.
  </p>
</section>`;

export function renderReservasList(eventos, year) {
  const sinFunciones = eventos.length === 0;
  const lista = eventos.slice(0, 8);

  let extraSchema = '';
  if (lista.length) {
    const items = lista.map((ev, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://tresempanadas.com.ar/reservas/${ev.id}/`,
      name: ev.nombre_show,
    }));
    const listSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items,
    };
    extraSchema = `<script type="application/ld+json">${JSON.stringify(listSchema)}</script>`;
  }

  let cuerpo;
  if (sinFunciones) {
    cuerpo = `
<section class="eventos-listado">
  <div class="eventos-vacio">
    <h2>Por ahora no hay funciones cargadas</h2>
    <p>Estamos preparando las próximas fechas. Mientras tanto, podés escribirnos por WhatsApp y te avisamos apenas tengamos novedades.</p>
    <a class="btn btn-primary"
       href="https://wa.me/542215247488?text=${encodeURIComponent('Hola! Cuándo es la próxima función en Tres Empanadas?')}"
       target="_blank" rel="noopener">
      Escribirnos por WhatsApp →
    </a>
  </div>
</section>`;
  } else {
    const cards = lista.map((ev) => {
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
      const cta = agotado ? 'Agotado' : programado ? 'Próximamente — ver más →' : 'Ver y reservar →';
      return `
      <a class="${clases}" href="/reservas/${id}/">
        <span class="evento-card__dia-badge">
          ${esc(ucfirst(ev.dia_semana))} · ${esc(ev.hora)}hs
        </span>
        <h2 class="evento-card__titulo">${esc(ev.nombre_show)}</h2>
        <p class="evento-card__fecha">${esc(fechaHumana(ev.fecha))}</p>
        ${elenco}
        <span class="evento-card__cta">${cta}</span>
      </a>`;
    }).join('\n');

    cuerpo = `
<section class="eventos-listado">
  <div class="eventos-listado__grid">
    ${cards}
  </div>
</section>`;
  }

  const content = `
<section class="reservas-hero">
  <div class="container">
    <h1>Reservar</h1>
    <p>Reservar es gratis y te asegura la mesa. Conviene — los lugares vuelan.</p>
  </div>
</section>
${SEMAFORO_TOP}
${cuerpo}
${EXTRA}
`;

  return page({
    title: 'Reservar — Próximas funciones | Tres Empanadas Comedia',
    description: 'Próximas funciones de stand up en Tres Empanadas — La Plata. Reservá gratis tu mesa.',
    url: 'https://tresempanadas.com.ar/reservas/',
    bodyClass: 'page-reservas-listado',
    extraCss: '/assets/css/reservas.css',
    extraSchema,
    currentPath: '/reservas/',
    content,
    year,
  });
}
