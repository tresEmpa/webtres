/** Listado de funciones — port de reservas/index.php */
import { page, esc, GOOGLE, estrellaSVG } from './layout.mjs';
import { eventoCard } from './evento-card.mjs';

const WA = '542215247488';

/** Es la noche del show, entre las 20 y las 22: el formulario ya no sirve. */
const AVISO_ULTIMA_HORA = `
<section class="evento-aviso tep-ultima-hora" data-tep-estado="ULTIMA_HORA">
  <span class="tep-ultima-hora__hora">Hoy hay función</span>
  <h2>¿Estás sobre la hora?</h2>
  <p>Consultanos por WhatsApp si quedan lugares. Te contestamos al toque.</p>
  <a href="https://wa.me/${WA}?text=${encodeURIComponent('Hola! Estoy sobre la hora para la función de hoy. ¿Quedan lugares?')}"
     target="_blank" rel="noopener"
     class="btn btn-primary tep-btn-wsp" id="tep-wsp-ultima-hora">
    Consultar por WhatsApp →
  </a>
  <p class="reserva-form__note">
    Recordá: las reservas vencen 21:45 y después de las 22:01 no se entra más.
  </p>
</section>`;

/** Ya pasaron las 22 de una noche de show. */
const AVISO_CERRADO = `
<section class="evento-aviso tep-cerrado" data-tep-estado="CERRADO">
  <h2>Por hoy ya cerramos</h2>
  <p>Mirá las próximas funciones y reservá para la que te quede mejor.</p>
</section>`;

/** La prueba social, arriba de todo: 4,9 sobre 140 opiniones. */
const CHAPA_GOOGLE = `
<a class="gmaps-chapa" href="${GOOGLE.url}" target="_blank" rel="noopener"
   aria-label="${GOOGLE.nota} estrellas sobre ${GOOGLE.opiniones} opiniones en Google Maps. Se abre en una pestaña nueva.">
  <span class="gmaps-chapa__nota">${GOOGLE.nota}</span>
  <span class="gmaps-chapa__lado">
    <span class="gmaps-estrellas">${estrellaSVG(18).repeat(5)}</span>
    <span class="gmaps-chapa__txt">${GOOGLE.opiniones} opiniones en Google Maps</span>
  </span>
</a>`;

/* === CARRUSEL DE CABECERA ===
   CSS puro (scroll-snap). Los puntitos son indicadores, no botones: se
   actualizan con un IntersectionObserver de 5 líneas al final del archivo.
   Sin JS igual funciona — se desliza con el dedo y el primer punto queda fijo. */
const SLIDES = [
  { img: 'cabecera-1-sala-llena',
    alt: 'Público en una función de stand up en Tres Empanadas, La Plata' },
  { img: 'cabecera-2-comediante',
    alt: 'Comediante en el escenario de Tres Empanadas' },
  { img: 'cabecera-3-escenario',
    alt: 'Escenario de Tres Empanadas con el mural Mondrian y el logo' },
];

const CARRUSEL = `
<section class="tep-carrusel" aria-label="Tres Empanadas por dentro">
  <div class="tep-carrusel__pista">
    ${SLIDES.map((s, i) => `
    <figure class="tep-carrusel__slide">
      <img src="/assets/img/${s.img}.webp" alt="${esc(s.alt)}"
           width="900" height="450" decoding="async"
           ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
      ${i === 0 ? `
      <figcaption class="tep-carrusel__overlay">
        <strong>Reservá y vení</strong>
        <span>Comedia, birra y más &middot; La Plata</span>
      </figcaption>` : ''}
    </figure>`).join('')}
  </div>
  <div class="tep-carrusel__dots" aria-hidden="true">
    ${SLIDES.map((_, i) => `<span class="tep-carrusel__dot${i === 0 ? ' is-activo' : ''}"></span>`).join('')}
  </div>
</section>`;

/* La respuesta a las tres preguntas del que cae desde un aviso:
   cuánto sale, cómo se paga, cuándo hay. */
const CLAIM = `
<ul class="reservas-claim">
  <li>Reservar es <strong>gratis</strong></li>
  <li>El show es <strong>a la gorra</strong></li>
  <li>Jueves y viernes <strong>21:30</strong></li>
</ul>`;

const SEMAFORO_TOP = `
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

  <div class="tep-galeria">
    <figure class="tep-galeria__item">
      <img src="/assets/img/lugar-salon.webp"
           alt="Salón de Tres Empanadas con mesas y bancos de madera"
           width="320" height="200" loading="lazy" decoding="async">
      <figcaption>El lugar</figcaption>
    </figure>
    <figure class="tep-galeria__item">
      <img src="/assets/img/lugar-fachada.webp"
           alt="Fachada violeta de Tres Empanadas de noche, en 43 y 22"
           width="320" height="200" loading="lazy" decoding="async">
      <figcaption>Cómo llegar</figcaption>
    </figure>
  </div>

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

/* === RESEÑAS DE GOOGLE ===
   Pegá acá las reseñas REALES (texto y nombre tal cual figuran en Google).
   Si el array queda vacío, el bloque no se renderiza y la página sigue igual. */
const RESENAS = [
   { texto: 'Me cagué de risa, muy rica comida y se la pasa re bien', autor: 'Zoe T.' },
   { texto: 'Olvidarse de los problemas con grandes risas..... Lindo plan.', autor: 'Martin D.' },
];

const BLOQUE_RESENAS = RESENAS.length ? `
<section class="tep-resenas" aria-labelledby="tep-resenas-tit">
  <h3 id="tep-resenas-tit">Lo que dicen los que vinieron</h3>
  <div class="tep-resenas__grid">
    ${RESENAS.map((r) => `
    <blockquote class="tep-resena">
      <span class="gmaps-estrellas">${estrellaSVG(13).repeat(5)}</span>
      <p>${esc(r.texto)}</p>
      <cite>${esc(r.autor)}</cite>
    </blockquote>`).join('')}
  </div>
  <a class="tep-resenas__link" href="${GOOGLE.url}" target="_blank" rel="noopener">
    Ver las ${GOOGLE.opiniones} opiniones en Google &rarr;
  </a>
</section>` : '';

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
    const cards = lista.map((ev) => eventoCard(ev)).join('\n');

    cuerpo = `
<section class="eventos-listado">
  <div class="eventos-listado__grid">
    ${cards}
  </div>
</section>`;
  }

  const content = `
${CARRUSEL}
<section class="reservas-hero">
  <div class="container">
    <h1>Reservar</h1>
    <p>Reservar es gratis y te asegura la mesa. Conviene — los lugares vuelan.</p>
    ${CHAPA_GOOGLE}
    ${CLAIM}
  </div>
</section>
${AVISO_ULTIMA_HORA}
${AVISO_CERRADO}
${SEMAFORO_TOP}
${cuerpo}
${EXTRA}
${BLOQUE_RESENAS}
<script>
(function () {
  // Puntitos del carrusel: marca el activo segun que slide se ve.
  var pista = document.querySelector('.tep-carrusel__pista');
  var dots  = document.querySelectorAll('.tep-carrusel__dot');
  if (pista && dots.length && 'IntersectionObserver' in window) {
    var slides = pista.querySelectorAll('.tep-carrusel__slide');
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = [].indexOf.call(slides, e.target);
        dots.forEach(function (d, j) { d.classList.toggle('is-activo', i === j); });
      });
    }, { root: pista, threshold: 0.6 });
    slides.forEach(function (sl) { obs.observe(sl); });
  }
})();
(function () {
  if (!window.TEP) return;
  var boton = document.getElementById('tep-wsp-ultima-hora');
  if (!boton) return;
  boton.addEventListener('click', function () {
    window.TEP_CONGELADO = true;
    TEP.track('Lead',          { content_category: 'reserva_ultima_hora' },
              'generate_lead', { content_category: 'reserva_ultima_hora' });
  });
})();
</script>
`;

  return page({
    title: 'Reservar — Próximas funciones | Tres Empanadas Comedia',
    description: 'Próximas funciones de stand up en Tres Empanadas — La Plata. Reservá gratis tu mesa.',
    url: 'https://tresempanadas.com.ar/reservas/',
    bodyClass: 'page-reservas-listado',
    extraCss: '/assets/css/reservas.css',
    extraSchema,
    currentPath: '/reservas/',
    // Todas las fechas de la cartelera: acá sí importa cualquier noche de show.
    funciones: eventos
      .filter((ev) => ev.fecha && (ev.estado || 'activo') !== 'cancelado')
      .map((ev) => ev.fecha),
    refrescarAgenda: true,
    content,
    year,
  });
}
