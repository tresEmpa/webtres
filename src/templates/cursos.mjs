/** Cursos — port de cursos/index.php */
import { page, esc } from './layout.mjs';

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * FLAG DE CURSO REGULAR
 *
 * false  → la página muestra el ESPACIO ABIERTO de los jueves (estado actual).
 *          El bloque del curso regular (inscripción, cuota, programa) NO se
 *          renderiza, pero queda guardado más abajo en este archivo, intacto.
 *
 * true   → vuelve a mostrarse el CURSO REGULAR como prioridad, con su formulario
 *          de inscripción arriba. Al reactivarlo, actualizá CURSO_FECHA y
 *          CURSO_PRECIO abajo.
 *
 * Para reabrir un curso (2027 en adelante): poné CURSO_REGULAR_ABIERTO = true
 * y revisá CURSO_FECHA / CURSO_PRECIO.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const CURSO_REGULAR_ABIERTO = false;
const CURSO_FECHA = 'el jueves 13 de agosto'; // usado sólo cuando el curso está abierto
const PRACTICA_HORA = '19:30'; // inicio del espacio abierto / práctica de los jueves
const CURSO_PRECIO = '$35.000';               // cuota mensual del curso regular

const COURSE_SCHEMA = `<script type="application/ld+json">
{
"@context": "https://schema.org",
"@type": "Course",
"name": "Curso de stand up en La Plata: presencial, online y práctica de los jueves",
"description": "Tres formas de aprender stand up con Checho Falco: curso presencial en Tres Empanadas Comedia (jueves 18 a 19:30), curso online gratis en aprendestandup.com.ar, u online más práctica abierta los jueves desde las 19:30.",
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
"offers": [
{ "@type": "Offer", "name": "Curso presencial (jueves 18 a 19:30)", "category": "Paid", "priceCurrency": "ARS", "price": "35000", "url": "https://tresempanadas.com.ar/cursos/" },
{ "@type": "Offer", "name": "Curso online (teoría)", "category": "Free", "priceCurrency": "ARS", "price": "0", "url": "https://aprendestandup.com.ar/notas/" },
{ "@type": "Offer", "name": "Online + práctica los jueves desde las 19:30", "category": "Gorra / Contribución voluntaria", "priceCurrency": "ARS", "price": "0", "url": "https://aprendestandup.com.ar/los-jueves/" }
],
"url": "https://tresempanadas.com.ar/cursos/"
}
</script>`;

export function renderCursos(year, lugar = {}) {
const wa = esc(lugar.whatsapp || '5492215247488');
const waDisplay = esc(lugar.whatsapp_display || '221 524-7488');
const precioCurso = CURSO_PRECIO;

// ── Estilos (se usan tanto para el espacio abierto como para el curso) ──
const estilos = `
<style>
.cursos-opciones { display: grid; gap: var(--space-md); margin-top: var(--space-md); }
.cursos-opcion { background: var(--crema-papel); border: 1px solid var(--gris-suave); border-radius: var(--radius-lg); padding: var(--space-md); text-align: left; }
.cursos-opcion h3 { font-family: var(--font-display); color: var(--rojo); text-transform: uppercase; letter-spacing: 0.04em; font-size: 1rem; margin: 0 0 4px; }
.cursos-opcion__estado { display: inline-block; font-family: var(--font-display); font-weight: 800; font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; background: var(--dorado); color: var(--rojo-tinto); padding: 3px 10px; border-radius: 999px; margin-bottom: 8px; }
.cursos-opcion__datos { font-family: var(--font-display); color: var(--rojo-tinto); margin: 6px 0; }
.cursos-opcion p { margin: 6px 0; }
.cursos-hero-foto { margin: var(--space-md) auto 0; max-width: 760px; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--gris-suave); box-shadow: 0 6px 24px rgba(0,0,0,0.12); }
.cursos-hero-foto img { display: block; width: 100%; height: auto; }
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
</style>`;

// ── Bloque de inscripción al CURSO REGULAR (sólo se renderiza si el curso está abierto) ──
const bloqueCursoRegular = `
<section class="cursos-bloque curso-nuevo" id="inscripcion">
<span class="curso-nuevo__badge">🔥 Cupos limitados</span>
<h2>Curso de stand up — arranca ${CURSO_FECHA}</h2>
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
try { if (typeof fbq === 'function') { fbq('track', 'Lead', { content_name: 'Curso stand up', content_category: 'curso' }); } } catch (_) {}
var msg = 'Hola! Me quiero anotar al curso de stand up.\\n\\nNombre: ' + nombre + '\\nWhatsApp: ' + wsp + '\\nExperiencia: ' + exp;
var url = 'https://wa.me/${wa}?text=' + encodeURIComponent(msg);
var form = document.getElementById('curso-form');
var exito = document.getElementById('curso-exito');
if (form) form.hidden = true;
if (exito) { exito.hidden = false; exito.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
var w = window.open(url, '_blank');
if (!w) window.location.href = url;
return false;
}
</script>`;

// ── CTA principal: coordinar el jueves por WhatsApp (espacio abierto) ──
const waEspacio = `https://wa.me/${wa}?text=` + encodeURIComponent('Hola! Quiero coordinar para venir un jueves al espacio abierto de stand up. Ya leí algo de aprendestandup.com.ar.');

const waProxima = `https://wa.me/${wa}?text=` + encodeURIComponent('Hola! Quiero que me avisen cuando se abra la próxima edición del curso presencial de stand up.');

// ── LAS TRES OPCIONES (misma redacción en tresempanadas, aprendestandup y nochesdestandup) ──
const tresOpciones = `
<section class="cursos-bloque" id="opciones">
<h2>Tres formas de aprender stand up</h2>
<p>Elegí la que te quede cómoda. Se pueden combinar y se complementan.</p>
<div class="cursos-opciones">

<article class="cursos-opcion" id="presencial">
<span class="cursos-opcion__estado">${CURSO_REGULAR_ABIERTO ? 'Inscripción abierta' : 'En marcha · sin cupos'}</span>
<h3>1 · Curso presencial</h3>
<p class="cursos-opcion__datos">Jueves 18 a 19:30 hs · 16 clases, de agosto a noviembre · ${precioCurso} por mes</p>
<p>Clases semanales con arranque y horario fijo, 2 open mics para probar tu material y una muestra final arriba del escenario. ${CURSO_REGULAR_ABIERTO ? '' : 'La edición 2026 ya está en marcha. Escribinos y te avisamos cuando abra la próxima.'}</p>
${CURSO_REGULAR_ABIERTO ? '' : `<p><a class="btn-whatsapp" href="${waProxima}" target="_blank" rel="noopener">Avisame de la próxima edición →</a></p>`}
</article>

<article class="cursos-opcion" id="online">
<h3>2 · Curso online (teoría)</h3>
<p class="cursos-opcion__datos">Gratis · a tu ritmo · sin horarios</p>
<p>Las notas de <a href="https://aprendestandup.com.ar/notas/" target="_blank" rel="noopener">Aprende Stand Up</a>: qué es el stand up, cómo se construye un chiste, remates, manejo del escenario y más.</p>
</article>

<article class="cursos-opcion" id="online-practica">
<h3>3 · Online + práctica de los jueves</h3>
<p class="cursos-opcion__datos">Teoría gratis + espacio abierto desde las ${PRACTICA_HORA} hs · a la gorra</p>
<p>Leés la teoría online y venís un jueves a trabajar tu material en el club. Avisá por WhatsApp qué jueves venís.</p>
<p><a class="btn-whatsapp" href="${waEspacio}" target="_blank" rel="noopener">Coordinar tu jueves →</a></p>
</article>

</div>
</section>`;

// ── HERO (cambia según el flag) ──
const hero = CURSO_REGULAR_ABIERTO
? `
<section class="cursos-hero">
<div class="container-narrow">
<h1>Taller y práctica de stand up en La Plata</h1>
<p>Curso con arranque fijo · La teoría, gratis en <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Aprende Stand Up</a> · Tres Empanadas Comedia</p>
</div>
</section>`
: `
<section class="cursos-hero">
<div class="container-narrow">
<h1>Curso de stand up en La Plata</h1>
<p>Tres formas de aprender con Checho Falco: curso presencial, online gratis, u online con práctica los jueves en el club. Vengas con una idea a medias o con cinco minutos listos, hay un lugar.</p>
<p style="margin-top:.6rem;">Teoría gratis en <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Aprende Stand Up</a> · Práctica los jueves desde las ${PRACTICA_HORA} · Tres Empanadas Comedia</p>
<div class="cursos-hero-foto">
<img src="/assets/img/espacio-jueves.webp" width="1200" height="1070" loading="eager" alt="Tres comediantes en el escenario de Tres Empanadas Comedia frente al público, mural Mondrian de fondo">
</div>
<p style="margin-top:var(--space-md);"><a class="btn-whatsapp" href="#opciones">Ver las tres opciones →</a></p>
</div>
</section>`;

// ── Mención seca del curso regular cuando NO está abierto (sin CTA, sin lista de espera) ──
const mencionCursoRegular = `
<section class="cursos-bloque">
<h2>Curso regular</h2>
<p>Cada tanto abrimos una edición del <strong>curso presencial</strong>: arranque y horario fijo, clases semanales y una estructura de principio a fin. La de 2026 está en marcha y sin cupos; para la próxima, escribinos por WhatsApp.</p>
</section>`;

const content = `
${hero}

<main class="cursos-main">

${estilos}

${CURSO_REGULAR_ABIERTO ? bloqueCursoRegular : ''}

${tresOpciones}

<section class="cursos-bloque">
<h2>Cómo funciona</h2>
<p>El stand up se aprende haciendo. La teoría ayuda, pero el escenario es donde pasan las cosas.</p>
<div class="cursos-destacado">
La teoría la tenés gratis en
<a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Aprende Stand Up</a>
— qué es el stand up, cómo se construye un chiste, tipos de remates, manejo del escenario y mucho más.
La leés a tu ritmo, sin horarios ni fechas.
</div>
<p>Y cuando querés, venís al club. No es una clase con lista y examen: es un espacio abierto donde trabajamos tu material con vos, estés donde estés. Hay quien viene cada jueves y hay quien viene cuando puede. Los dos tienen lugar.</p>
</section>

<section class="cursos-bloque">
<h2>Qué podés traer</h2>
<p>No hace falta llegar con algo terminado. Podés venir con:</p>
<ul class="cursos-lista">
<li>Una duda sobre algo que leíste y no te cierra</li>
<li>Un chiste que no termina de funcionar</li>
<li>Una idea a medias, algo suelto, lo que sea</li>
<li>Material armado para subir al escenario y probarlo</li>
</ul>
<p>Lo trabajamos con vos, a tu ritmo. Desde el que abre Aprende por primera vez hasta el que ya tiene cinco minutos y quiere pulirlos.</p>
<div class="cursos-aviso">
⚠ Lo único que pedimos: que hayas leído algo antes de venir. No arrancamos de la nada — para eso está <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Aprende</a>, y es gratis.
</div>
</section>

<section class="cursos-bloque">
<h2>Los jueves en el club</h2>
<div class="cursos-horario">
<span>Curso presencial (edición en marcha)</span>
<span class="cursos-horario__hora">18 a 19:30 hs</span>
</div>
<div class="cursos-horario">
<span>Espacio abierto / práctica</span>
<span class="cursos-horario__hora">${PRACTICA_HORA} hs</span>
</div>
<div class="cursos-horario">
<span>El Rotativo Platense (show)</span>
<span class="cursos-horario__hora">21:30 hs</span>
</div>
<p style="margin-top:1rem;">Cada jueves el Tres Empanadas abre para trabajar el stand up. Y si te quedás, a las 21:30 arranca <strong>El Rotativo Platense</strong> — el show semanal donde vas a ver arriba del escenario a gente que empezó exactamente donde estás vos ahora.</p>
<p>El espacio es a la gorra: aportás lo que puedas según tus posibilidades.</p>
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

${CURSO_REGULAR_ABIERTO ? '' : mencionCursoRegular}

<section class="cursos-bloque cursos-bloque--cta">
<h2>¿Te sumás?</h2>
<p>El espacio abierto es todos los jueves desde las ${PRACTICA_HORA}. Avisá por WhatsApp qué jueves venís y lo coordinamos, así te esperamos.</p>
<a class="btn-whatsapp" href="${waEspacio}" target="_blank" rel="noopener">Coordinar por WhatsApp →</a>
</section>

</main>
`;

const meta = CURSO_REGULAR_ABIERTO
? {
title: 'Curso de Stand Up en La Plata | Tres Empanadas Comedia',
description: 'Curso de stand up en La Plata en Tres Empanadas Comedia. Práctica presencial los jueves y show El Rotativo Platense. Anotate.',
}
: {
title: 'Curso de Stand Up en La Plata: presencial, online y práctica',
description: 'Curso de stand up en La Plata: presencial los jueves, online gratis o online con práctica desde las 19:30 en Tres Empanadas Comedia. Elegí cómo empezar.',
};

return page({
title: meta.title,
description: meta.description,
url: 'https://tresempanadas.com.ar/cursos/',
image: 'https://tresempanadas.com.ar/assets/img/espacio-jueves.webp',
bodyClass: 'page-cursos',
extraCss: '/assets/css/cursos.css',
extraSchema: COURSE_SCHEMA,
currentPath: '/cursos/',
content,
year,
});
}
