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
