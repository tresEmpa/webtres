/** Cursos — port de cursos/index.php */
import { page } from './layout.mjs';

const COURSE_SCHEMA = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Taller de Stand Up en La Plata — Práctica los jueves",
  "description": "Práctica presencial de stand up los jueves en Tres Empanadas Comedia (La Plata). La teoría, gratis y online, en aprendestandup.com.ar.",
  "sameAs": "https://aprendestandup.com.ar",
  "provider": {
    "@type": "Organization",
    "name": "Tres Empanadas Comedia",
    "url": "https://tresempanadas.com.ar",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle 43 N° 1349 esquina 22",
      "addressLocality": "La Plata",
      "addressRegion": "Buenos Aires",
      "addressCountry": "AR"
    },
    "telephone": "+5492215247488"
  },
  "instructor": {
    "@type": "Person",
    "name": "Checho Falco"
  },
  "courseMode": ["onsite", "online"],
  "inLanguage": "es",
  "isAccessibleForFree": true,
  "offers": {
    "@type": "Offer",
    "category": "Gorra / Contribución voluntaria",
    "priceCurrency": "ARS",
    "price": "0"
  },
  "url": "https://tresempanadas.com.ar/cursos/"
}
</script>`;

export function renderCursos(year) {
  const content = `
<section class="cursos-hero">
  <div class="container-narrow">
    <h1>Taller y práctica de stand up en La Plata</h1>
    <p>Práctica en el escenario los jueves · La teoría, gratis en <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">aprendestandup.com.ar</a> · A tu ritmo · Tres Empanadas Comedia</p>
  </div>
</section>

<main class="cursos-main">

  <section class="cursos-bloque">
    <h2>Cómo funciona</h2>
    <p>El stand up se aprende haciendo. La teoría ayuda, pero el escenario es donde pasan las cosas.</p>
    <div class="cursos-destacado">
      La teoría está publicada gratis en
      <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">aprendestandup.com.ar</a>
      — qué es el stand up, cómo construir un chiste, tipos de remates, manejo del escenario y mucho más.
      Lo leés a tu ritmo, sin horarios ni fechas.
    </div>
    <p>Y cuando querés, venís al club. Manejás tus tiempos — hay quien viene cada jueves y hay quien viene cuando puede. El espacio está abierto para los dos.</p>
  </section>

  <section class="cursos-bloque">
    <h2>Los jueves en el club</h2>
    <div class="cursos-horario">
      <span>Práctica y apoyo</span>
      <span class="cursos-horario__hora">19 a 21 hs</span>
    </div>
    <div class="cursos-horario">
      <span>El Rotativo Platense</span>
      <span class="cursos-horario__hora">21:30 hs</span>
    </div>
    <p style="margin-top:1rem;">Cada jueves el Tres Empanadas abre sus puertas para trabajar el stand up. Podés traer lo que quieras:</p>
    <ul class="cursos-lista">
      <li>Una duda sobre algo que leíste</li>
      <li>Un chiste que no termina de funcionar</li>
      <li>Material para subir al escenario y probar</li>
      <li>Una pregunta suelta, una idea a medias, lo que sea</li>
    </ul>
    <p>Te guiamos en el proceso, a tu ritmo. No hace falta tener nada terminado para venir.</p>
    <p>Y si te quedás, a las 21:30 arranca <strong>El Rotativo Platense</strong> — el show semanal donde vas a ver en el escenario a comediantes que empezaron exactamente donde estás vos ahora.</p>
    <div class="cursos-aviso">
      ⚠ No son clases típicas. Sí pedimos que hayas leído algo antes de venir — no aceptamos alumnos en blanco.
    </div>
  </section>

  <section class="cursos-bloque">
    <h2>El camino</h2>
    <div class="cursos-camino">
      <span class="cursos-camino__paso">Leés</span>
      <span class="cursos-camino__flecha">→</span>
      <span class="cursos-camino__paso">Venís los jueves</span>
      <span class="cursos-camino__flecha">→</span>
      <span class="cursos-camino__paso">Open mic</span>
      <span class="cursos-camino__flecha">→</span>
      <span class="cursos-camino__paso">Show real</span>
    </div>
    <p style="text-align:center;">De los jueves salen los participantes de nuestro open mic. Y del open mic, los que se suman al elenco.</p>
  </section>

  <section class="cursos-bloque">
    <h2>La participación</h2>
    <p>La teoría es gratuita y está en <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">aprendestandup.com.ar</a>.</p>
    <p>Los jueves de práctica no son gratis — te pedimos una contribución voluntaria de acuerdo a tus posibilidades.</p>
  </section>

  <section class="cursos-bloque cursos-bloque--cta">
    <h2>¿Querés arrancar?</h2>
    <p>Entrá a aprendestandup.com.ar, empezá a leer, y cuando quieras venir avisá por WhatsApp. El resto lo construimos juntos.</p>
    <a class="btn-whatsapp" href="https://wa.me/542215247488?text=Hola%2C%20quiero%20venir%20los%20jueves%20a%20practicar%20stand%20up" target="_blank" rel="noopener">
      📲 Avisá por WhatsApp — 221 524-7488
    </a>
    <a class="btn-secundario" href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Ir a la teoría →</a>
  </section>

</main>
`;

  return page({
    title: 'Taller de Stand Up en La Plata — Práctica los jueves | Tres Empanadas Comedia',
    description: 'Práctica presencial de stand up los jueves en Tres Empanadas Comedia (La Plata). La teoría, gratis y online, en aprendestandup.com.ar. A tu ritmo, avisá y vení.',
    url: 'https://tresempanadas.com.ar/cursos/',
    image: 'https://tresempanadas.com.ar/assets/img/og-default.jpg',
    bodyClass: 'page-cursos',
    extraCss: '/assets/css/cursos.css',
    extraSchema: COURSE_SCHEMA,
    currentPath: '/cursos/',
    content,
    year,
  });
}
