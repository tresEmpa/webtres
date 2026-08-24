/**
 * Páginas perennes: /reservas/jueves/ y /reservas/viernes/
 *
 * Por qué existen
 * ───────────────
 * Antes estas dos URLs eran un redirect 302 a la función de esa semana. Eso
 * las dejaba sin página propia: nunca podían posicionar por su cuenta, y toda
 * la autoridad iba a una URL con fecha que caduca en siete días. Encima el
 * sitemap las declaraba, así que Google las veía como "página con redirección".
 *
 * Ahora son páginas de verdad, con contenido que no vence: de qué se trata el
 * ciclo de ese día, y abajo las próximas fechas. Son las que tienen que ganar
 * las búsquedas del tipo "stand up jueves La Plata"; las páginas con fecha se
 * quedan con lo suyo, que es la función puntual y su flyer.
 *
 * La lista de fechas se congela en el build, igual que el listado general, y el
 * script de estado la corrige en el navegador contra /data/agenda.json.
 */
import { page, esc, GOOGLE, estrellaSVG } from './layout.mjs';
import { eventoCard } from './evento-card.mjs';

const WA = '542215247488';

/** Lo propio de cada ciclo. Es el contenido que le da sentido a la URL. */
const DIAS = {
  jueves: {
    dia: 'jueves',
    otro: 'viernes',
    ciclo: 'El Rotativo Platense',
    color: 'violeta',
    h1: 'Stand up los jueves en La Plata',
    bajada: 'Todos los jueves a las 21:30, El Rotativo Platense: el line-up cambia cada semana.',
    title: 'Stand up los jueves en La Plata | Tres Empanadas Comedia',
    description: 'Stand up todos los jueves a las 21:30 en La Plata. El Rotativo Platense, con line-up rotativo. Entrada a la gorra y reserva gratis en Calle 43 y 22.',
    cuerpo: [
      'Los jueves en Tres Empanadas son <strong>El Rotativo Platense</strong>. El nombre no es un capricho: el line-up rota todas las semanas. Podés encontrarte con comediantes que llevan años de escenario y con alguien que está probando material nuevo esa misma noche.',
      'Es un <strong>microteatro</strong>, no un bar con un micrófono en un rincón: la gente viene a ver el show. Somos pocas mesas, y por eso conviene reservar — es gratis y te asegura el lugar.',
      'El show es <strong>a la gorra</strong>: aportás al final lo que te parezca. Mientras tanto hay empanadas, cerveza artesanal tirada y opciones sin alcohol.',
    ],
    taller: true,
  },
  viernes: {
    dia: 'viernes',
    otro: 'jueves',
    ciclo: 'Sociedad Platense de Stand Up',
    color: 'rojo',
    h1: 'Stand up los viernes en La Plata',
    bajada: 'Todos los viernes a las 21:30, la Sociedad Platense de Stand Up: el clásico de la casa.',
    title: 'Stand up los viernes en La Plata | Tres Empanadas Comedia',
    description: 'Stand up todos los viernes a las 21:30 en La Plata. Sociedad Platense de Stand Up. Entrada a la gorra y reserva gratis en Calle 43 y 22.',
    cuerpo: [
      'Los viernes son de la <strong>Sociedad Platense de Stand Up</strong>, el ciclo de la casa y el más viejo de los dos. Es el show que más gente trae, así que es el que primero se llena.',
      'Es un <strong>microteatro</strong>: pocas mesas, escenario a dos metros y la gente viene a ver el show. Reservar es gratis y te asegura la mesa.',
      'El show es <strong>a la gorra</strong>: aportás al final lo que te parezca. Hay empanadas, cerveza artesanal tirada y opciones sin alcohol.',
    ],
    taller: false,
  },
};

const SEMAFORO = `
<div class="horarios-card horarios-card--top" data-tep-estado="NORMAL SIN_FUNCION ULTIMA_HORA">
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

/**
 * @param {'jueves'|'viernes'} dia
 * @param {object[]} eventosDelDia  Próximas funciones de ese día, ya filtradas y ordenadas.
 * @param {number} year
 * @param {Date} now
 */
export function renderDia(dia, eventosDelDia, year, now = new Date()) {
  const d = DIAS[dia];
  if (!d) throw new Error(`Día sin configurar: ${dia}`);

  const cards = eventosDelDia.length
    ? `
<section class="eventos-listado">
  <div class="eventos-listado__grid">
    ${eventosDelDia.map((ev) => eventoCard(ev, now)).join('\n')}
  </div>
</section>`
    : `
<section class="eventos-listado">
  <div class="eventos-vacio">
    <h2>Todavía no cargamos el próximo ${esc(d.dia)}</h2>
    <p>Suele confirmarse unos días antes. Escribinos y te avisamos apenas esté.</p>
    <a class="btn btn-primary"
       href="https://wa.me/${WA}?text=${encodeURIComponent(`Hola! Cuándo es la próxima función del ${d.dia}?`)}"
       target="_blank" rel="noopener">
      Preguntar por WhatsApp →
    </a>
  </div>
</section>`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://tresempanadas.com.ar/' },
      { '@type': 'ListItem', position: 2, name: 'Reservar', item: 'https://tresempanadas.com.ar/reservas/' },
      { '@type': 'ListItem', position: 3, name: d.h1, item: `https://tresempanadas.com.ar/reservas/${d.dia}/` },
    ],
  };

  // A propósito no lleva schema Event: la función puntual ya lo declara en su
  // propia página, y dos URLs marcando el mismo evento sólo confunden a Google.
  const extraSchema = `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;

  const tallerBlock = d.taller ? `
  <h3>De paso: el taller</h3>
  <p>
    Los jueves desde las 18hs hay <strong>taller libre</strong>, antes del show.
    Si querés probar, <a href="/cursos/">mirá cómo es</a>.
  </p>` : '';

  const content = `
<section class="reservas-hero">
  <div class="container">
    <h1>${esc(d.h1)}</h1>
    <p>${esc(d.bajada)}</p>
    <a class="gmaps-chapa" href="${GOOGLE.url}" target="_blank" rel="noopener"
       aria-label="${GOOGLE.nota} estrellas sobre ${GOOGLE.opiniones} opiniones en Google Maps. Se abre en una pestaña nueva.">
      <span class="gmaps-chapa__nota">${GOOGLE.nota}</span>
      <span class="gmaps-chapa__lado">
        <span class="gmaps-estrellas">${estrellaSVG(18).repeat(5)}</span>
        <span class="gmaps-chapa__txt">${GOOGLE.opiniones} opiniones en Google Maps</span>
      </span>
    </a>
  </div>
</section>
${SEMAFORO}
${cards}
<section class="reservas-extra">
  <h3>Cómo son los ${esc(d.dia)}</h3>
  ${d.cuerpo.map((p) => `<p>${p}</p>`).join('\n  ')}

  <h3>Cómo llegar</h3>
  <p>
    Calle 43 N° 1349, esquina 22 — La Plata.
    Es la fachada violeta con las cortinas amarillas, no tiene pérdida.
  </p>

  <h3>Antes de venir</h3>
  <p>🎟️ <strong>La reserva es gratuita.</strong> Aceptamos efectivo, tarjeta, QR y transferencia.</p>
  <p>✋ Se puede ver el show sin consumir.</p>
  <p>🌾 No tenemos menú sin TACC, pero podés traer tu propia comida.</p>
  <p>🔞 El humor y el ambiente son <strong>para adultos</strong>.</p>
  <p>🥟 <a href="/carta/">Ver la carta</a>.</p>
${tallerBlock}

  <h3>¿Y los ${esc(d.otro)}?</h3>
  <p>
    También hay función: <a href="/reservas/${esc(d.otro)}/">${esc(DIAS[d.otro].ciclo)}, todos los ${esc(d.otro)}</a>.
    O mirá <a href="/reservas/">la cartelera completa</a>.
  </p>
</section>`;

  return page({
    title: d.title,
    description: d.description,
    url: `https://tresempanadas.com.ar/reservas/${d.dia}/`,
    bodyClass: `page-reservas-listado page-dia page-dia--${d.dia}`,
    extraCss: '/assets/css/reservas.css',
    extraSchema,
    currentPath: '/reservas/',
    funciones: eventosDelDia.map((ev) => ev.fecha),
    refrescarAgenda: true,
    content,
    year,
  });
}
