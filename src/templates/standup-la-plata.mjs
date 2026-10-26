/** /stand-up-la-plata/ — página de SEO para "stand up la plata".
 *
 *  Hasta el 24/10/2026 fue la landing de Google Ads y estaba recortada para el
 *  clasificador de Google (sin enlaces a /reservas/, navegación mínima).
 *  Tres decidió no invertir más en Google Ads (la pauta va a Meta), así que la
 *  página vuelve a ser una página normal del sitio: navegación completa, atajo
 *  a reservar y enlaces internos a funciones, carta y cursos.
 */
import { page } from './layout.mjs';

/** Semáforo de llegada — mismo componente y mismos horarios que home y reservas. */
function semaforo(aria) {
  return `<div class="semaforo" aria-label="${aria}">
        <div class="semaforo__row semaforo__row--verde">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">21:00</span>
          <span class="semaforo__label">Tempranito</span>
        </div>
        <div class="semaforo__row semaforo__row--amarillo">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">21:30</span>
          <span class="semaforo__label">Bien, justito</span>
        </div>
        <div class="semaforo__row semaforo__row--naranja">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">21:45</span>
          <span class="semaforo__label">Último ingreso</span>
        </div>
        <div class="semaforo__row semaforo__row--rojo">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">22:01</span>
          <span class="semaforo__label">No se entra más</span>
        </div>
      </div>`;
}

const SCHEMA = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type":"Question","name":"¿Dónde hay stand up en La Plata?","acceptedAnswer":{"@type":"Answer","text":"En Tres Empanadas Comedia, Calle 43 N° 1349 esquina 22, en el casco de La Plata. Es la fachada violeta con cortinas amarillas."}},
    {"@type":"Question","name":"¿Qué días hay función?","acceptedAnswer":{"@type":"Answer","text":"Todos los viernes con la Sociedad Platense de Stand Up y muchos jueves con El Rotativo Platense. Alguna vez, un martes."}},
    {"@type":"Question","name":"¿A qué hora conviene llegar?","acceptedAnswer":{"@type":"Answer","text":"La sala abre 21:00 y conviene llegar temprano. El ingreso cierra 22:01, porque la sala es chica y abrir la puerta con el show empezado corta la función."}},
    {"@type":"Question","name":"¿Cuánto cuesta?","acceptedAnswer":{"@type":"Answer","text":"No hay ticketera ni cobro anticipado. El show es a la gorra: al final cada uno aporta lo que le parezca. Se puede ver el show sin consumir nada."}},
    {"@type":"Question","name":"¿Pueden ir menores?","acceptedAnswer":{"@type":"Answer","text":"No. El humor y el ambiente son para adultos."}}
  ]
}
</script>`;

export function renderStandupLaPlata(year) {
  const content = `
<section class="ads-hero">
  <div class="container ads-hero__inner">
    <div class="ads-hero__copy">
      <p class="ads-kicker">Club de comedia · 43 y 22</p>
      <h1>Stand Up <span>en La Plata</span></h1>
      <p class="ads-lead">
        Microteatro de comedia en el casco urbano. Comediantes platenses,
        el público cerca del escenario y una función distinta cada semana.
      </p>
      <div class="ads-actions">
        <a class="btn btn-primary" href="/reservas/">Ver funciones y reservar</a>
        <a class="btn btn-outline" href="#donde">Ver dónde queda</a>
      </div>
    </div>

    <figure class="ads-hero__card" aria-label="Tres Empanadas Comedia">
      <img src="/assets/img/logo.png" alt="Tres Empanadas Comedia" width="220" height="220">
      <figcaption>
        <strong>Jueves y viernes</strong>
        <span>43 y 22 · La Plata</span>
      </figcaption>
    </figure>
  </div>
</section>

<section class="ads-strip" aria-label="Datos principales">
  <div class="container ads-strip__grid">
    <div>
      <small>Días</small>
      <strong>Jue y Vie</strong>
    </div>
    <div>
      <small>Función</small>
      <strong>21:30</strong>
    </div>
    <div>
      <small>Lugar</small>
      <strong>43 y 22</strong>
    </div>
  </div>
</section>

<div class="mondrian-divider" aria-hidden="true"><div></div><div></div><div></div><div></div><div></div></div>

<section class="ads-section">
  <div class="container ads-two-col">
    <div>
      <h2>Qué es Tres Empanadas Comedia</h2>
      <p>
        Es un <strong>microteatro de stand up en La Plata</strong>: una sala chica,
        íntima y con onda, donde el público está cerca del escenario y cada noche
        se vive distinta.
      </p>
      <p>
        Acá se mezclan comediantes con años de escenario, nuevas voces de la ciudad
        y shows que van cambiando semana a semana.
      </p>
      <p>
        No somos un restaurante ni un bar grande. Somos un
        <strong>club de comedia independiente</strong> hecho para escuchar, reírse
        y pasarla bien. Funciona igual si venís solo, en pareja o con amigos.
      </p>
    </div>
    <div class="ads-note">
      <h3>Qué vas a encontrar</h3>
      <ul>
        <li>Comedia en vivo en La Plata.</li>
        <li>Humoristas locales.</li>
        <li>Sala chica y clima cercano.</li>
        <li>Un plan distinto para el finde.</li>
      </ul>
    </div>
  </div>
</section>

<section class="ads-fondo" id="como-es">
  <div class="container">

    <p class="ads-kicker">Antes de venir</p>
    <h2>Cómo es una noche de stand up acá</h2>

    <figure class="ads-foto">
      <img src="/assets/img/interior-publico.jpg"
           alt="Público riéndose durante una función de stand up en Tres Empanadas Comedia, La Plata"
           width="1400" height="1050" loading="lazy">
      <figcaption>Una noche cualquiera en 43 y 22.</figcaption>
    </figure>

    <div class="ads-fondo__grid">

      <article>
        <h3>Los ciclos</h3>
        <p>
          Los viernes toca <a href="/reservas/viernes/"><strong>Sociedad Platense de Stand Up</strong></a>, con Checho
          Falco y Julián Dorati. Es el clásico de la casa, y viene haciendo comedia
          en La Plata desde 2013.
        </p>
        <p>
          Muchos jueves va <a href="/reservas/jueves/"><strong>El Rotativo Platense</strong></a>: ahí el line-up cambia
          cada semana, con comediantes de años de escenario y voces nuevas que rotan.
        </p>
        <p>
          Alguna que otra vez hay función un martes.
        </p>
      </article>

      <article>
        <h3>A qué hora llegar</h3>
        <p>
          La sala abre a las <strong>21:00</strong>. Conviene venir tempranito.
        </p>
        ${semaforo('Horarios de llegada')}
        <p>
          Después de las <strong>22:01</strong> no se entra más. La sala es chica y
          abrir la puerta con el show empezado le arruina la función a todos.
        </p>
      </article>

      <article>
        <h3>Cuánto sale</h3>
        <p>
          <strong>No hay ticketera ni cobro anticipado.</strong> El show es a la
          gorra: al final aportás lo que puedas y lo que te haya parecido que valió.
        </p>
        <p>
          Reservar es gratis y te guarda el lugar:
          <a href="/reservas/">elegí la función</a>.
        </p>
        <p>
          Se puede ver el show sin consumir nada.
        </p>
      </article>

      <article>
        <h3>Para comer y tomar</h3>
        <p>
          Hay <strong>empanadas</strong>, snacks, cervezas artesanales tiradas, latas
          y opciones sin alcohol. Mirá <a href="/carta/">la carta</a>.
        </p>
        <p>
          No tenemos menú sin TACC, pero podés traer tu propia comida. Sin drama.
        </p>
      </article>

      <article>
        <h3>Algunas cosas más</h3>
        <p>
          El humor y el ambiente son <strong>para adultos</strong>.
        </p>
        <p>
          Se puede venir solo, y pasa seguido: la sala es chica y el clima se arma
          rápido.
        </p>
        <p>
          Los jueves desde las 19:30 hay
          <a href="/cursos/">espacio abierto de stand up</a>, para trabajar tu material.
        </p>
      </article>

      <article>
        <h3>El lugar</h3>
        <p>
          Somos un <strong>microteatro</strong>, no un resto ni un bar grande.
          Entran pocas mesas y el escenario está a un par de pasos del público.
        </p>
        <p>
          Estamos en pleno casco urbano, a la vuelta de todo.
        </p>
      </article>

    </div>
  </div>
</section>

<section class="ads-location" id="donde">
  <div class="container ads-location__inner">
    <div>
      <p class="ads-kicker">Dónde queda</p>
      <h2>Calle 43 N° 1349, esquina 22</h2>
      <p>La Plata, Buenos Aires.</p>
      <p>
        Es la <strong>fachada violeta con las cortinas amarillas</strong>:
        no tiene pérdida.
      </p>
    </div>

    <figure class="ads-location__foto">
      <img src="/assets/img/lugar-fachada.webp"
           alt="Fachada violeta de Tres Empanadas Comedia al anochecer, con el cartel de neón, en 43 y 22, La Plata"
           width="1400" height="876" loading="lazy">
    </figure>
  </div>
</section>
`;

  return page({
    title: 'Stand Up en La Plata | Club de Comedia en 43 y 22',
    description: 'Microteatro de stand up en La Plata: sala chica, comediantes platenses y funciones jueves y viernes 21:30 en 43 y 22. El show es a la gorra.',
    url: 'https://tresempanadas.com.ar/stand-up-la-plata/',
    image: 'https://tresempanadas.com.ar/assets/img/interior-publico.jpg',
    bodyClass: 'page-standup-ads',
    extraCss: '/assets/css/standup-ads.css',
    extraSchema: SCHEMA,
    currentPath: '/stand-up-la-plata/',
    content,
    year,
  });
}
