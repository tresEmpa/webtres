/** Cursos — port de cursos/index.php */
import { page, esc } from './layout.mjs';

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

export function renderCursos(year, lugar = {}) {
  const wa = esc(lugar.whatsapp || '5492215247488');
  const waDisplay = esc(lugar.whatsapp_display || '221 524-7488');
  const precioCurso = '$35.000'; // cuota mensual (cambiar acá si el monto varía)
  const content = `
<section class="cursos-hero">
  <div class="container-narrow">
    <h1>Taller y práctica de stand up en La Plata</h1>
    <p>Práctica en el escenario los jueves · La teoría, gratis en <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">aprendestandup.com.ar</a> · A tu ritmo · Tres Empanadas Comedia</p>
  </div>
</section>

<main class="cursos-main">

  <style>
    .curso-nuevo { border: 2px solid var(--dorado); background: var(--crema); text-align: center; }
    .curso-nuevo::before { background: var(--dorado); }
    .curso-nuevo__badge {
      display: inline-block; background: var(--rojo); color: var(--crema);
      font-family: var(--font-display); font-weight: 800; font-size: 0.7rem;
      letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px;
      border-radius: 999px; margin-bottom: var(--space-sm);
    }
    .curso-nuevo .cursos-horario { text-align: left; }
    .curso-nuevo__precio { font-family: var(--font-display); font-size: 1.1rem; color: var(--rojo-tinto); margin-top: var(--space-md) !important; }
    .curso-nuevo__precio strong { color: var(--rojo); font-size: 1.4rem; }
    .curso-nuevo__precio small { display: block; font-family: var(--font-body); font-style: italic; font-size: 0.85rem; color: var(--gris-text); margin-top: 2px; }
    .curso-nuevo__pago { font-family: var(--font-body); font-size: 0.92rem; font-style: italic; color: var(--gris-text); max-width: 40ch; margin: 0.5rem auto 0; line-height: 1.4; }
    .curso-nuevo__nota { font-family: var(--font-body); font-size: 0.85rem; font-style: italic; color: var(--gris-text); max-width: 46ch; margin: 0.6rem auto 0; line-height: 1.4; }
    .curso-nuevo__nota a { color: var(--rojo); }
    .curso-nuevo__programa { margin: var(--space-md) auto 0; max-width: 40ch; text-align: left; background: var(--crema-papel); border: 1px solid var(--gris-suave); border-radius: var(--radius); padding: var(--space-sm) var(--space-md); }
    .curso-nuevo__programa .programa-titulo { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.8rem; color: var(--rojo); text-align: center; margin: 0 0 8px; }
    .curso-nuevo__programa ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .curso-nuevo__programa li { font-family: var(--font-body); font-size: 0.95rem; color: var(--gris-text); padding-left: 1.5rem; position: relative; line-height: 1.4; }
    .curso-nuevo__programa li::before { content: '→'; position: absolute; left: 0; color: var(--rojo); font-family: var(--font-display); font-weight: 700; }
    .curso-nuevo__programa li strong { color: var(--rojo); font-family: var(--font-display); }
    .curso-form__btn { width: 100%; background: var(--rojo, #B33227); color: var(--crema, #F1E8D2); border: none; padding: 15px 20px; border-radius: var(--radius, 8px); font-family: var(--font-display); font-weight: 800; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer; margin-top: 4px; }
    .curso-form__btn:active { opacity: 0.9; }
    .curso-form { text-align: left; margin-top: var(--space-md); background: var(--crema-papel); border: 1px solid var(--gris-suave); border-radius: var(--radius-lg); padding: var(--space-md); }
    .curso-form h3 { font-family: var(--font-display); color: var(--rojo); text-transform: uppercase; letter-spacing: 0.06em; font-size: 1rem; text-align: center; margin-bottom: var(--space-md); }
    .curso-form__campo { margin-bottom: var(--space-sm); }
    .curso-form__campo label { display: block; font-family: var(--font-display); font-weight: 700; font-size: 0.8rem; color: var(--gris-text); margin-bottom: 6px; letter-spacing: 0.02em; }
    .curso-form__campo input, .curso-form__campo select { width: 100%; padding: 12px 14px; border: 2px solid var(--gris-suave); border-radius: var(--radius); font-family: var(--font-body); font-size: 1rem; background: #fff; color: var(--gris-text); }
    .curso-form__campo input:focus, .curso-form__campo select:focus { outline: none; border-color: var(--rojo); }
    .curso-form__note { font-family: var(--font-body); font-size: 0.8rem; color: var(--gris-text); text-align: center; margin-top: var(--space-sm) !important; }
    .curso-exito { text-align: center; background: var(--crema-papel); border: 2px solid var(--dorado); border-radius: var(--radius-lg); padding: var(--space-lg); margin-top: var(--space-md); }
    .curso-exito h3 { font-family: var(--font-display); color: var(--rojo); margin-bottom: var(--space-sm); }
  </style>

  <section class="cursos-bloque curso-nuevo" id="inscripcion">
    <span class="curso-nuevo__badge">🔥 Cupos limitados</span>
    <h2>Curso de stand up — arranca el jueves 13 de agosto</h2>
    <p>Un curso con arranque y horario fijo para meterte de lleno en el stand up. Y si querés, te quedás a la práctica abierta y al show. Todo el mismo jueves.</p>

    <div class="curso-nuevo__programa">
      <p class="programa-titulo">La cursada · de agosto a noviembre</p>
      <ul>
        <li><strong>16 clases</strong> semanales, los jueves</li>
        <li><strong>2 open mics</strong> para probar tu material en vivo</li>
        <li><strong>1 muestra final</strong> arriba del escenario</li>
      </ul>
    </div>

    <div class="cursos-horario"><span>Curso de stand up</span><span class="cursos-horario__hora">18 a 19:30 hs</span></div>
    <div class="cursos-horario"><span>Práctica abierta</span><span class="cursos-horario__hora">20 hs</span></div>
    <div class="cursos-horario"><span>El Rotativo Platense (show)</span><span class="cursos-horario__hora">21:30 hs</span></div>
    <p class="curso-nuevo__nota">La práctica abierta de las 20 hs es para los alumnos libres de <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">aprendestandup.com.ar</a> (la teoría, gratis y online). Si hacés el curso y te querés quedar, dale — sos bienvenido/a.</p>

    <p class="curso-nuevo__precio">Cuota: <strong>${precioCurso}</strong><small>por mes</small></p>
    <p class="curso-nuevo__pago">😌 No pagás nada por adelantado. Anotate, vení, y el pago lo arreglamos personalmente según tu medio de pago (efectivo, tarjeta, transferencia o QR).</p>

    <form class="curso-form" id="curso-form" onsubmit="return inscribirCurso(event)">
      <h3>Anotate al curso</h3>
      <div class="curso-form__campo">
        <label for="c-nombre">Nombre</label>
        <input type="text" id="c-nombre" name="nombre" required autocomplete="name" placeholder="¿Cómo te llamás?">
      </div>
      <div class="curso-form__campo">
        <label for="c-wsp">WhatsApp</label>
        <input type="tel" id="c-wsp" name="whatsapp" required inputmode="tel" autocomplete="tel" placeholder="Ej: 221 555 1234">
      </div>
      <div class="curso-form__campo">
        <label for="c-exp">¿Hiciste stand up antes?</label>
        <select id="c-exp" name="experiencia" required>
          <option value="" disabled selected>Elegí una opción</option>
          <option value="Nunca hice, arranco de cero">Nunca hice, arranco de cero</option>
          <option value="Hice algo / probé">Hice algo / probé alguna vez</option>
          <option value="Ya tengo experiencia">Ya tengo experiencia</option>
        </select>
      </div>
      <button type="submit" class="curso-form__btn">Anotarme al curso →</button>
      <p class="curso-form__note">Te abrimos WhatsApp con tu inscripción lista para enviar. No te suscribimos a nada.</p>
    </form>

    <div class="curso-exito" id="curso-exito" hidden>
      <h3>✓ ¡Buenísimo! Ya casi</h3>
      <p>Te abrimos WhatsApp con tu inscripción. <strong>Enviá ese mensaje</strong> para quedar anotado/a. Si no se abrió solo, escribinos al ${waDisplay}.</p>
    </div>
  </section>

  <script>
    function inscribirCurso(e) {
      e.preventDefault();
      var nombre = (document.getElementById('c-nombre').value || '').trim();
      var wsp = (document.getElementById('c-wsp').value || '').trim();
      var exp = document.getElementById('c-exp').value || '';
      if (!nombre || !wsp || !exp) { alert('Completá tu nombre, WhatsApp y experiencia 🙌'); return false; }
      try { if (typeof gtag === 'function') { gtag('event', 'conversion', { 'send_to': 'AW-11304999909/reserva_whatsapp' }); } } catch (_) {}
      try { if (typeof fbq === 'function') { fbq('track', 'Lead', { content_name: 'Curso stand up 13-08', content_category: 'curso' }); } } catch (_) {}
      var msg = 'Hola! Me quiero anotar al curso de stand up (arranca el jueves 13/8).\\n\\nNombre: ' + nombre + '\\nWhatsApp: ' + wsp + '\\nExperiencia: ' + exp;
      var url = 'https://wa.me/${wa}?text=' + encodeURIComponent(msg);
      var form = document.getElementById('curso-form');
      var exito = document.getElementById('curso-exito');
      if (form) form.hidden = true;
      if (exito) { exito.hidden = false; exito.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      var w = window.open(url, '_blank');
      if (!w) window.location.href = url;
      return false;
    }
  </script>

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
      <span>Curso de stand up</span>
      <span class="cursos-horario__hora">18 a 19:30 hs</span>
    </div>
    <div class="cursos-horario">
      <span>Práctica abierta</span>
      <span class="cursos-horario__hora">20 hs</span>
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
    <p>El <strong>curso de stand up</strong> (arranca el 13 de agosto) tiene una cuota de <strong>${precioCurso}</strong> por mes.</p>
    <p>La <strong>práctica abierta</strong> de los jueves sigue a la gorra — aportás lo que puedas de acuerdo a tus posibilidades.</p>
  </section>

  <section class="cursos-bloque cursos-bloque--cta">
    <h2>¿Querés arrancar?</h2>
    <p>Anotate al curso que arranca el 13 de agosto, o si preferís venir a la práctica libre de los jueves, avisá por WhatsApp.</p>
    <a class="btn-whatsapp" href="#inscripcion">📝 Anotarme al curso →</a>
    <a class="btn-secundario" href="https://wa.me/${wa}?text=Hola%2C%20quiero%20venir%20los%20jueves%20a%20practicar%20stand%20up" target="_blank" rel="noopener">O avisá para la práctica libre →</a>
  </section>

</main>
`;

  return page({
    title: 'Taller de Stand Up en La Plata — Práctica los jueves | Tres Empanadas Comedia',
    description: 'Nuevo curso de stand up en La Plata: arranca el jueves 13 de agosto, cupos limitados. Práctica presencial los jueves en Tres Empanadas Comedia y show El Rotativo Platense. Anotate.',
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
