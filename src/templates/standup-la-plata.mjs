/** Landing limpia para Google Ads: sin entradas, sin gastronomía, sin cursos. */
import { page } from './layout.mjs';

const WHATSAPP = 'https://wa.me/5492215247488?text=Hola%2C%20quiero%20reservar%20lugar%20para%20stand%20up';

const WEBPAGE_SCHEMA = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Stand Up en La Plata",
  "url": "https://tresempanadas.com.ar/stand-up-la-plata/",
  "description": "Comedia en vivo en La Plata. Sociedad Platense de Stand Up en Tres Empanadas Comedia. Viernes 21:30 en 43 y 22."
}
</script>`;

export function renderStandupLaPlata(year) {
  const content = `
<section class="ads-hero">
  <div class="container ads-hero__inner">
    <div class="ads-hero__copy">
      <p class="ads-kicker">Sociedad Platense de Stand Up</p>
      <h1>Stand Up <span>en La Plata</span></h1>
      <p class="ads-lead">
        Comedia en vivo, humoristas locales y una sala chica para venir a reírte cerca de casa.
      </p>
      <div class="ads-actions">
        <a class="btn btn-primary" href="${WHATSAPP}" target="_blank" rel="noopener">Reservá tu lugar</a>
        <a class="btn btn-outline" href="#donde">Ver ubicación</a>
      </div>
    </div>

    <figure class="ads-hero__card" aria-label="Tres Empanadas Comedia">
      <img src="/assets/img/logo.png" alt="Tres Empanadas Comedia" width="220" height="220">
      <figcaption>
        <strong>Viernes 21:30</strong>
        <span>43 y 22 · La Plata</span>
      </figcaption>
    </figure>
  </div>
</section>

<section class="ads-strip" aria-label="Datos principales">
  <div class="container ads-strip__grid">
    <div>
      <small>Día</small>
      <strong>Viernes</strong>
    </div>
    <div>
      <small>Hora</small>
      <strong>21:30</strong>
    </div>
    <div>
      <small>Lugar</small>
      <strong>43 y 22</strong>
    </div>
  </div>
</section>

<section class="ads-section">
  <div class="container ads-two-col">
    <div>
      <h2>Una noche distinta</h2>
      <p>
        La Sociedad Platense de Stand Up se presenta en Tres Empanadas Comedia
        con shows cercanos, simples y divertidos.
      </p>
      <p>
        Si buscás un plan de viernes en La Plata, vení a conocer el club de comedia
        de 43 y 22.
      </p>
    </div>
    <div class="ads-note">
      <h3>Qué vas a encontrar</h3>
      <ul>
        <li>Comedia en vivo en La Plata.</li>
        <li>Humoristas locales.</li>
        <li>Sala chica y clima cercano.</li>
        <li>Un plan distinto para el viernes.</li>
      </ul>
    </div>
  </div>
</section>

<section class="ads-location" id="donde">
  <div class="container ads-location__inner">
    <div>
      <p class="ads-kicker">Dónde y cuándo</p>
      <h2>Tres Empanadas Comedia</h2>
      <p>43 y 22, La Plata.</p>
      <p>Viernes 21:30.</p>
    </div>
    <a class="btn btn-primary" href="${WHATSAPP}" target="_blank" rel="noopener">Reservá tu lugar</a>
  </div>
</section>

<!-- ── CONTENIDO DE FONDO ────────────────────────────────────────────────
     Va deliberadamente al final, después de los dos CTA. Arriba manda la
     conversión del anuncio; acá abajo está el cuerpo que la página necesita
     para existir en orgánico, más los enlaces internos que la sacan de
     huérfana. La navegación de la cabecera sigue recortada (adsSafe). -->
<section class="ads-fondo" id="como-es">
  <div class="container">

    <p class="ads-kicker">Antes de venir</p>
    <h2>Cómo es una noche de stand up acá</h2>

    <div class="ads-fondo__grid">

      <article>
        <h3>Los ciclos</h3>
        <p>
          Los <a href="/reservas/viernes/">viernes</a> toca <strong>Sociedad Platense de Stand Up</strong>,
          con Checho Falco y Julián Dorati. Es el clásico de la casa.
        </p>
        <p>
          Muchos <a href="/reservas/jueves/">jueves</a> va <strong>El Rotativo Platense</strong>: ahí el
          line-up cambia cada semana, con comediantes de años de escenario y voces nuevas que rotan.
        </p>
        <p>
          Las fechas confirmadas están siempre en la <a href="/reservas/">cartelera</a>.
        </p>
      </article>

      <article>
        <h3>Horarios</h3>
        <p>
          La sala abre <strong>21:00</strong> y el show arranca <strong>21:30</strong>.
          Dura alrededor de 90 minutos.
        </p>
        <p>
          Las reservas se sostienen hasta las <strong>21:45</strong>. Después de las
          <strong>22:01</strong> no se entra más: la sala es chica y abrir la puerta con el show
          empezado le arruina la función a todos.
        </p>
      </article>

      <article>
        <h3>Cuánto sale</h3>
        <p>
          <strong>La reserva es gratis y el show es a la gorra.</strong> Al final aportás lo que
          puedas y lo que te haya parecido que valió. Efectivo, tarjeta, QR o transferencia.
        </p>
        <p>
          Se puede ver el show sin consumir nada.
        </p>
      </article>

      <article>
        <h3>Para comer y tomar</h3>
        <p>
          Hay <strong>empanadas</strong>, cervezas artesanales tiradas, latas y opciones sin
          alcohol. Está todo en <a href="/carta/">la carta</a>.
        </p>
        <p>
          No tenemos menú sin TACC, pero podés traer tu propia comida.
        </p>
      </article>

      <article>
        <h3>Cómo llegar</h3>
        <p>
          <strong>Calle 43 N° 1349, esquina 22</strong>, en el casco de La Plata.
          Es la fachada violeta con las cortinas amarillas: no tiene pérdida.
        </p>
        <p>
          Somos un <strong>microteatro</strong>, no un resto ni un bar grande. Entran pocas mesas,
          y por eso conviene reservar.
        </p>
      </article>

      <article>
        <h3>Algunas cosas más</h3>
        <p>
          El humor y el ambiente son <strong>para adultos</strong>.
        </p>
        <p>
          Se puede venir solo, y pasa seguido: la sala es chica y el clima se arma rápido.
        </p>
        <p>
          ¿Querés hacer stand up vos? Los jueves desde las 18:00 hay
          <a href="/cursos/">taller libre</a>.
        </p>
      </article>

    </div>
  </div>
</section>
`;

  return page({
    title: 'Stand Up en La Plata | Tres Empanadas Comedia',
    description: 'Comedia en vivo en La Plata. Sociedad Platense de Stand Up en Tres Empanadas Comedia. Viernes 21:30 en 43 y 22.',
    url: 'https://tresempanadas.com.ar/stand-up-la-plata/',
    bodyClass: 'page-standup-ads',
    extraCss: '/assets/css/standup-ads.css',
    extraSchema: WEBPAGE_SCHEMA,
    currentPath: '/stand-up-la-plata/',
    content,
    year,
    adsSafe: true,
  });
}
