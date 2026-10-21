/**
 * /intensivo/ — Intensivo de arranque.
 *
 * Los datos de la edición viven en src/lib/intensivo.mjs. Esta página tiene
 * dos estados:
 *   - con edición vigente: la vende (fecha, cómo es la tarde, precio, Anotarme)
 *   - sin edición: "próximo intensivo a confirmar" + avisame por WhatsApp,
 *     para que la página siga captando entre ediciones y no pierda posición.
 *
 * Texto aprobado por Tres el 21/10/2026. No anunciar acá el trabajo de imagen
 * ni el elefante: es interno, se descubre en el intensivo.
 */
import { page, esc } from './layout.mjs';
import { INTENSIVO, intensivoVigente } from '../lib/intensivo.mjs';

const URL = 'https://tresempanadas.com.ar/intensivo/';

const ESTILOS = `
<style>
.int-badge { display: inline-block; background: var(--dorado); color: var(--rojo-tinto); font-family: var(--font-display); font-weight: 800; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; margin-bottom: var(--space-sm); }
.int-datos { font-family: var(--font-display); color: var(--rojo-tinto); font-size: 1.05rem; line-height: 1.5; margin-top: .4rem; }
.int-datos strong { color: var(--rojo); }
.int-tarde { list-style: none; margin: var(--space-sm) 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.int-tarde li { padding-left: 1.6rem; position: relative; line-height: 1.45; }
.int-tarde li::before { content: '→'; position: absolute; left: 0; color: var(--rojo); font-family: var(--font-display); font-weight: 700; }
.int-cta { text-align: center; border: 2px solid var(--dorado); background: var(--crema); }
.int-precio { font-family: var(--font-display); color: var(--rojo-tinto); font-size: 1.1rem; margin: 0 0 var(--space-sm) !important; }
.int-precio strong { color: var(--rojo); font-size: 1.6rem; }
.int-nota { font-size: .92rem; color: var(--gris-text); max-width: 46ch; margin: var(--space-sm) auto 0 !important; line-height: 1.45; }
.int-precio small { display: block; font-family: var(--font-body); font-style: italic; font-size: .9rem; color: var(--gris-text); margin-top: 2px; }
</style>`;

function waLink(texto) {
  return 'https://wa.me/5492215247488?text=' + encodeURIComponent(texto);
}

function schema(ed) {
  const inicio = `${ed.fecha}T${ed.horaInicio}:00-03:00`;
  const fin = `${ed.fecha}T${ed.horaFin}:00-03:00`;
  return `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Intensivo de stand up en La Plata',
  description: 'Una tarde de cuatro horas para empezar en el stand up: teoría y práctica en el escenario, y un plan para seguir. Con Checho Falco en Tres Empanadas Comedia.',
  url: URL,
  inLanguage: 'es',
  provider: { '@type': 'Organization', name: 'Tres Empanadas Comedia', url: 'https://tresempanadas.com.ar' },
  instructor: { '@type': 'Person', name: 'Checho Falco' },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'onsite',
    startDate: inicio,
    endDate: fin,
    location: {
      '@type': 'Place',
      name: 'Tres Empanadas Comedia',
      address: { '@type': 'PostalAddress', streetAddress: 'Calle 43 N° 1349 esquina 22', addressLocality: 'La Plata', addressRegion: 'Buenos Aires', addressCountry: 'AR' },
    },
  },
  offers: { '@type': 'Offer', category: 'Paid', price: String(ed.precioNumero), priceCurrency: 'ARS', url: URL },
}, null, 2)}
</script>`;
}

export function renderIntensivo(year, now = new Date()) {
  const ed = INTENSIVO;
  const vigente = intensivoVigente(now);

  if (!vigente) {
    const avisame = waLink('Hola! Quiero que me avisen cuando haya fecha para el próximo intensivo de stand up.');
    const content = `
<section class="cursos-hero">
<div class="container-narrow">
<span class="int-badge">${esc(ed.nombre)}</span>
<h1>Taller inicial de Stand Up en La Plata</h1>
<p>Una tarde para empezar en el stand up, en el escenario del club.</p>
</div>
</section>
<main class="cursos-main">
${ESTILOS}
<section class="cursos-bloque int-cta">
<h2>Próximo intensivo a confirmar</h2>
<p>Lo hacemos algunos feriados y sábados. Dejanos tu WhatsApp y te avisamos apenas haya fecha.</p>
<a class="btn-whatsapp" href="${avisame}" target="_blank" rel="noopener">Avisame cuando haya fecha →</a>
</section>
<section class="cursos-bloque">
<h2>Mientras tanto</h2>
<p>La teoría está gratis y online en <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Aprende Stand Up</a>, y los jueves hay práctica en el club. <a href="/cursos/">Ver todas las formas de empezar →</a></p>
</section>
</main>`;
    return page({
      title: 'Intensivo de stand up en La Plata | Tres Empanadas Comedia',
      description: 'Una tarde para empezar en el stand up, con teoría y práctica en el escenario de Tres Empanadas, La Plata. Próxima fecha a confirmar.',
      url: URL,
      bodyClass: 'page-cursos',
      extraCss: '/assets/css/cursos.css',
      currentPath: '/cursos/',
      content,
      year,
    });
  }

  const cuando = `${ed.fechaTexto}${ed.fechaNota ? ` (${ed.fechaNota})` : ''}`;
  const anotarme = ed.inscripcionUrl
    || waLink(`Hola! Quiero anotarme al intensivo de stand up del ${ed.fechaTexto}.`);
  const anotarmeAttrs = ed.inscripcionUrl ? '' : ' target="_blank" rel="noopener"';

  const content = `
<section class="cursos-hero">
<div class="container-narrow">
<span class="int-badge">${esc(ed.nombre)}</span>
<h1>Taller inicial de Stand Up en La Plata</h1>
<p class="int-datos"><strong>${esc(cuando.charAt(0).toUpperCase() + cuando.slice(1))}</strong><br>${esc(ed.horario)} · Tres Empanadas, 43 y 22, La Plata</p>
<p>Una tarde para empezar en el stand up, en el escenario del club.</p>
<p style="margin-top:var(--space-md);"><a class="btn-whatsapp" href="#anotarme">Anotarme →</a></p>
</div>
</section>

<main class="cursos-main">
${ESTILOS}

<section class="cursos-bloque">
<h2>Una puerta de entrada</h2>
<p>No es el curso de cuatro meses en cuatro horas: es la puerta de entrada. Una introducción, un panorama para entender de qué se trata y arrancar a escribir.</p>
<p>Y si te quedan ganas, seguís vinculado al espacio de formación del club con las alternativas de <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Aprende Stand Up</a>: el material online y el espacio presencial de los jueves.</p>
</section>

<section class="cursos-bloque">
<h2>Cómo es la tarde</h2>
<ul class="int-tarde">
<li>Mezclamos todo el tiempo teoría y práctica en el escenario.</li>
<li>Descansamos un rato en el medio.</li>
<li>Vale traer mate, agua o lo que quieras.</li>
<li>Podés salir a fumar.</li>
<li>Te vas con un plan para seguir.</li>
</ul>
</section>

<section class="cursos-bloque">
<h2>Antes de venir</h2>
<p>Cuando te anotás recibís acceso a una plataforma con material y una tarea breve que vamos a utilizar oportunamente.</p>
</section>

<section class="cursos-bloque">
<h2>Incluye</h2>
<ul class="int-tarde">
<li>La tarde completa, ${esc(ed.horario)}.</li>
<li>El material online.</li>
${ed.showNoche ? `<li>Una invitación al show de las ${esc(ed.showNoche)}.</li>` : ''}
</ul>
</section>

<section class="cursos-bloque int-cta" id="anotarme">
<h2>Anotate</h2>
<p class="int-precio"><strong>${esc(ed.precio)}</strong><small>Grupo reducido</small></p>
<a class="btn-whatsapp" href="${esc(anotarme)}"${anotarmeAttrs}>Anotarme →</a>
<p class="int-nota">Para anotarte vas a entrar a Aprende Stand Up, la plataforma de formación de Tres Empanadas, con tu cuenta de Google. Ahí cargás tus datos, tenés el material para llegar al taller y las opciones de pago: transferencia o tarjeta.</p>
</section>

<section class="cursos-bloque">
<h2>¿Preferís otra forma de empezar?</h2>
<p>Hay curso presencial, teoría gratis online y práctica los jueves. <a href="/cursos/">Ver todas las opciones →</a></p>
</section>
</main>`;

  return page({
    title: `Intensivo de stand up en La Plata · ${ed.fechaTexto.replace(/^\w+ /, '')} | Tres Empanadas`,
    description: `Una tarde para empezar en el stand up: ${ed.fechaTexto}, ${ed.horario}, en Tres Empanadas. Teoría y práctica en el escenario, y un plan para seguir.`,
    url: URL,
    bodyClass: 'page-cursos',
    extraCss: '/assets/css/cursos.css',
    extraSchema: schema(ed),
    currentPath: '/cursos/',
    content,
    year,
  });
}
