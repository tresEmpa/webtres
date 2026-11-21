/**
 * /comediantes/ y /comediantes/<slug>/ — una página por comediante que pasa
 * seguido por el club. Sirven para que quien busca el nombre de un comediante
 * de la escena platense llegue a sus funciones en Tres Empanadas.
 *
 * Ojo con aprendestandup.com.ar/comediantes-la-plata/: esa es la lista
 * "quiénes son" (intención informativa). Estas son "dónde y cuándo verlo"
 * (intención de ir). Se enlazan entre sí y no compiten.
 */
import { page, esc } from './layout.mjs';
import { fechaHumana, ucfirst } from '../lib/eventos.mjs';

const BASE = 'https://tresempanadas.com.ar';

const CSS = `
<style>
.comed { max-width: 760px; margin: 0 auto; padding: var(--space-xl) var(--space-md); }
.comed h1 { font-size: clamp(1.9rem, 5vw, 2.75rem); margin-bottom: var(--space-sm); }
.comed__bio { font-size: 1.0625rem; line-height: 1.55; margin-bottom: var(--space-md); }
.comed__ig { display: inline-block; margin-bottom: var(--space-lg); font-weight: 700; }
.comed h2 { font-size: 1.25rem; margin: var(--space-lg) 0 var(--space-sm); }
.comed ul { list-style: none; padding: 0; margin: 0; }
.comed li { padding: .6rem 0; border-bottom: 1px solid rgba(0,0,0,.08); display: flex; flex-direction: column; gap: .15rem; }
.comed li a { font-weight: 700; }
.comed__meta { font-size: .95rem; color: var(--gris-text); }
.comed__cta { margin-top: var(--space-lg); }
.comed__lista li a { font-size: 1.125rem; }
</style>`;

function itemFuncion(ev, now) {
  const fecha = ucfirst(fechaHumana(ev.fecha, false, now));
  const otros = (ev.elenco || []).filter(Boolean).join(' · ');
  return `
      <li>
        <a href="/reservas/${esc(ev.id)}/">${esc(ev.nombre_show)}</a>
        <span class="comed__meta">${esc(fecha)}, ${esc(ev.hora || '21:30')}${otros ? ` · ${esc(otros)}` : ''}</span>
      </li>`;
}

export function renderComediante(com, year, now = new Date()) {
  const url = `${BASE}/comediantes/${com.slug}/`;
  const ig = com.instagram ? `https://www.instagram.com/${com.instagram}/` : '';

  const proximas = com.proximas.length
    ? `<h2>Próximas funciones en Tres Empanadas</h2><ul>${com.proximas.map((ev) => itemFuncion(ev, now)).join('')}
    </ul>`
    : `<h2>Próximas funciones</h2>
    <p>Por ahora no tiene fecha confirmada. <a href="/reservas/">Mirá la cartelera de esta semana</a>.</p>`;

  const pasadas = com.pasadas.length
    ? `<h2>Funciones del último año</h2><ul>${com.pasadas.map((ev) => itemFuncion(ev, now)).join('')}
    </ul>`
    : '';

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: com.nombre,
    url,
    jobTitle: 'Comediante de stand up',
    description: com.bio,
    ...(ig ? { sameAs: [ig] } : {}),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Comediantes', item: `${BASE}/comediantes/` },
      { '@type': 'ListItem', position: 3, name: com.nombre, item: url },
    ],
  };

  const content = `${CSS}
<div class="comed">
  <p class="comed__meta"><a href="/comediantes/">Comediantes</a></p>
  <h1>${esc(com.nombre)}</h1>
  <p class="comed__bio">${esc(com.bio)}</p>
  ${ig ? `<a class="comed__ig" href="${ig}" target="_blank" rel="noopener">Instagram @${esc(com.instagram)}</a>` : ''}
  ${proximas}
  ${pasadas}
  <p class="comed__cta"><a href="/reservas/" class="btn btn-primary">Reservar una función</a></p>
</div>
`;

  const prox = com.proximas[0];
  const description = prox
    ? `${com.nombre} en Tres Empanadas, 43 y 22, La Plata. Próxima función: ${fechaHumana(prox.fecha, false, now)} a las ${prox.hora || '21:30'}. Stand up a la gorra, reservá gratis.`
    : `${com.nombre}, comediante de stand up de La Plata. Sus funciones en Tres Empanadas, 43 y 22. Stand up a la gorra.`;

  return page({
    title: `${com.nombre} — stand up en La Plata | Tres Empanadas`,
    description,
    url,
    bodyClass: 'page-comediante',
    currentPath: `/comediantes/${com.slug}/`,
    extraSchema: `<script type="application/ld+json">${JSON.stringify(person)}</script>`
      + `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`,
    content,
    year,
  });
}

export function renderComediantesIndex(lista, year, now = new Date()) {
  const items = lista.map((c) => {
    const prox = c.proximas[0];
    const meta = prox
      ? `Próxima: ${ucfirst(fechaHumana(prox.fecha, false, now))}`
      : `${c.pasadas.length} funciones en el último año`;
    return `
      <li>
        <a href="/comediantes/${esc(c.slug)}/">${esc(c.nombre)}</a>
        <span class="comed__meta">${esc(meta)}</span>
      </li>`;
  }).join('');

  const content = `${CSS}
<div class="comed">
  <h1>Comediantes del Tres Empanadas</h1>
  <p class="comed__bio">Los que se suben seguido al escenario de 43 y 22, La Plata: el elenco de la Sociedad Platense de Stand Up de los viernes y los que rotan por El Rotativo Platense de los jueves. Más sobre cada uno en <a href="https://aprendestandup.com.ar/comediantes-la-plata/">Aprende Stand Up</a>.</p>
  <ul class="comed__lista">${items}
  </ul>
  <p class="comed__cta"><a href="/reservas/" class="btn btn-primary">Ver funciones y reservar</a></p>
</div>
`;

  return page({
    title: 'Comediantes de stand up en La Plata | Tres Empanadas',
    description: 'Los comediantes que se presentan seguido en Tres Empanadas, 43 y 22, La Plata: Checho Falco, Julián Dorati, Rubén Vaena y más. Sus próximas funciones.',
    url: `${BASE}/comediantes/`,
    bodyClass: 'page-comediantes',
    currentPath: '/comediantes/',
    content,
    year,
  });
}
