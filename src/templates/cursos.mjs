/** Cursos — port de cursos/index.php */
import { page, esc } from './layout.mjs';
import { INTENSIVO, intensivoVigente } from '../lib/intensivo.mjs';

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
const CURSO_PRECIO = '$50.000';               // cuota mensual del curso regular

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
{ "@type": "Offer", "name": "Curso presencial (jueves 18 a 19:30)", "category": "Paid", "priceCurrency": "ARS", "price": "50000", "url": "https://tresempanadas.com.ar/cursos/" },
{ "@type": "Offer", "name": "Curso online (teoría)", "category": "Free", "priceCurrency": "ARS", "price": "0", "url": "https://aprendestandup.com.ar/notas/" },
{ "@type": "Offer", "name": "Online + práctica los jueves desde las 19:30", "category": "Gorra / Contribución voluntaria", "priceCurrency": "ARS", "price": "0", "url": "https://aprendestandup.com.ar/los-jueves/" }
],
"url": "https://tresempanadas.com.ar/cursos/"
}
</script>`;

export function renderCursos(year, lugar = {}, now = new Date()) {
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
.alt-wrap { margin: 1.2rem 0; }
.alt-titulo { font-weight: 800; text-transform: uppercase; letter-spacing: .06em; font-size: .85rem; color: var(--rojo); margin: 0 0 .5rem; }
.alt-tabla { width: 100%; border-collapse: collapse; background: var(--crema-papel); border: 1px solid var(--gris-suave); border-radius: 10px; overflow: hidden; font-size: .95rem; line-height: 1.4; text-align: left; }
.alt-tabla th, .alt-tabla td { padding: .7rem .8rem; border-bottom: 1px solid var(--gris-suave); vertical-align: top; }
.alt-tabla thead th { background: var(--rojo); color: #fff; font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; }
.alt-tabla tbody th { color: var(--rojo); font-weight: 800; white-space: nowrap; }
.alt-tabla tbody tr:last-child th, .alt-tabla tbody tr:last-child td { border-bottom: 0; }
.alt-tabla a { color: var(--rojo); font-weight: 700; white-space: nowrap; }
.alt-num { display: inline-grid; place-items: center; width: 1.5em; height: 1.5em; border-radius: 50%; background: var(--rojo); color: #fff; font-size: .8em; margin-right: .3em; vertical-align: .05em; }
.alt-tabla a.alt-btn { display: inline-block; background: var(--rojo); color: #fff; text-decoration: none; padding: .45rem .9rem; border-radius: 999px; font-weight: 700; font-size: .9rem; }
.alt-tabla a.alt-btn:hover { opacity: .9; }
.alt-aviso { display: flex; flex-direction: column; gap: .5rem; margin-top: .2rem; max-width: 320px; }
.alt-aviso input { padding: .55rem .7rem; border: 1px solid var(--gris-suave, #ddd); border-radius: 8px; font: inherit; font-size: .95rem; background: #fff; }
.alt-aviso .alt-btn { border: 0; cursor: pointer; font: inherit; font-weight: 700; }
.alt-trampa { position: absolute; left: -9999px; }
.alt-aviso-msg { font-size: .85rem; color: var(--rojo); }
.alt-aviso-ok { font-weight: 700; color: var(--rojo); }
.alt-destino { display: block; font-size: .75rem; opacity: .7; margin-top: .35rem; }
@media (max-width: 640px) {
.alt-tabla thead { display: none; }
.alt-tabla, .alt-tabla tbody, .alt-tabla tr, .alt-tabla th, .alt-tabla td { display: block; width: 100%; }
.alt-tabla tr { border-bottom: 1px solid var(--gris-suave); padding: .4rem 0; }
.alt-tabla th, .alt-tabla td { border: 0; padding: .25rem .8rem; }
}
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
<p>Un curso con arranque y horario fijo para meterte de lleno en el stand up. Y si querés, te quedás al espacio abierto y al show. Todo el mismo jueves.</p>

<div class="curso-nuevo__programa">
<p class="programa-titulo">La cursada · de agosto a noviembre</p>
<ul>
<li><strong>16 clases</strong> semanales, los jueves</li>
<li><strong>2 open mics</strong> para probar tu material en vivo</li>
<li><strong>1 muestra final</strong> arriba del escenario</li>
</ul>
</div>

<div class="cursos-horario"><span>Curso de stand up</span><span class="cursos-horario__hora">18 a 19:30 hs</span></div>
<div class="cursos-horario"><span>Espacio abierto</span><span class="cursos-horario__hora">${PRACTICA_HORA} hs</span></div>
<div class="cursos-horario"><span>El Rotativo Platense (show)</span><span class="cursos-horario__hora">21:30 hs</span></div>
<p class="curso-nuevo__nota">El espacio abierto de las ${PRACTICA_HORA} hs es para los alumnos libres de <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">aprendestandup.com.ar</a> (la teoría, gratis y online). Si hacés el curso y te querés quedar, dale — sos bienvenido/a.</p>

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


// ── LAS CUATRO OPCIONES (misma redacción en tresempanadas, aprendestandup y nochesdestandup) ──
const tresOpciones = `
<section class="cursos-bloque" id="opciones">
<h2>Cómo empezar en el stand up</h2>
<div class="alt-wrap">
<p class="alt-titulo">4 alternativas para empezar</p>
<table class="alt-tabla">
<thead><tr><th scope="col">Alternativa</th><th scope="col">Qué es</th><th scope="col"></th></tr></thead>
<tbody>
<tr id="taller-inicial"><th scope="row"><span class="alt-num">1</span> Taller inicial<br><small style="font-weight:600;text-transform:none;letter-spacing:0;white-space:normal">Intensivo con lo esencial para arrancar</small></th><td>Una tarde de 4 horas para arrancar de cero. Es una edición especial: la hacemos algunos feriados y sábados.</td><td><a class="alt-btn" href="/intensivo/">Ver el taller →</a></td></tr>
<tr id="presencial"><th scope="row"><span class="alt-num">2</span> Curso presencial</th><td>Cuatro meses, una clase por semana, con arranque y horario fijo. La edición 2026 está completa; la próxima, en 2027.</td><td><button class="alt-btn" type="button" onclick="this.hidden=true;var f=this.nextElementSibling;f.hidden=false;f.querySelector('input[type=email]').focus()">Avisame →</button><form class="alt-aviso" hidden onsubmit="return avisameCurso(event)"><input name="nombre" autocomplete="name" placeholder="Tu nombre" maxlength="80"><input name="email" type="email" inputmode="email" autocomplete="email" placeholder="Tu mail" required maxlength="120"><input name="web" class="alt-trampa" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="alt-btn" type="submit">Avisame cuando abra</button><span class="alt-aviso-msg"></span></form></td></tr>
<tr id="online-practica"><th scope="row"><span class="alt-num">3</span> Online + jueves en el club</th><td>Leés el material online y los jueves venís al club a trabajar lo que escribiste o tus dudas. Desde las 19:30, a la gorra.</td><td><a class="alt-btn" href="https://aprendestandup.com.ar/los-jueves/">Cómo funciona →</a><span class="alt-destino">🎙️ Te llevamos a Aprende Stand Up, nuestra escuela online</span></td></tr>
<tr id="online"><th scope="row"><span class="alt-num">4</span> Por las tuyas</th><td>Te dejamos el material online para que avances solo, a tu ritmo y desde donde estés. Gratis.</td><td><a class="alt-btn" href="https://aprendestandup.com.ar/notas/">Empezar →</a><span class="alt-destino">🎙️ Te llevamos a Aprende Stand Up, nuestra escuela online</span></td></tr>
</tbody>
</table>
<script>
function avisameCurso(e) {
  e.preventDefault();
  var f = e.target, msg = f.querySelector('.alt-aviso-msg'), btn = f.querySelector('button');
  btn.disabled = true; msg.textContent = '';
  fetch('https://aprendestandup.com.ar/api/avisame', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nombre: f.nombre.value, email: f.email.value, web: f.web.value, origen: 'tresempanadas', para: 'curso' }) })
    .then(function (r) { if (!r.ok) throw r; f.innerHTML = '<span class="alt-aviso-ok">¡Listo! Te avisamos cuando abra el curso de 2027.</span>'; })
    .catch(function () { msg.textContent = 'No se pudo guardar. Revisá el mail y probá de nuevo.'; btn.disabled = false; });
  return false;
}
</script>
</div>
</section>`;

// ── AVISO DEL TALLER INICIAL (sólo con fecha confirmada: INTENSIVO.anunciarEnCursos) ──
const avisoIntensivo = (INTENSIVO.anunciarEnCursos && intensivoVigente(now)) ? `
<section class="cursos-bloque curso-nuevo" id="taller-inicial-aviso">
<span class="curso-nuevo__badge">Intensivo con lo esencial para arrancar</span>
<h2>Próximo taller inicial: ${esc(INTENSIVO.fechaTexto)}</h2>
<p>${esc(INTENSIVO.horario)} en Tres Empanadas. Una tarde para empezar, con teoría y práctica en el escenario.</p>
<p style="margin-top:var(--space-sm);"><a class="btn-whatsapp" href="/intensivo/">Ver el taller →</a></p>
</section>` : '';

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
<p>Cuatro formas de aprender con Checho Falco: un taller inicial de una tarde, el curso presencial, online con el espacio abierto de los jueves en el club, u online por tu cuenta, gratis. Vengas con una idea a medias o con cinco minutos listos, hay un lugar.</p>
<p style="margin-top:.6rem;">Teoría gratis en <a href="https://aprendestandup.com.ar" target="_blank" rel="noopener">Aprende Stand Up</a> · Espacio abierto los jueves desde las ${PRACTICA_HORA} · Tres Empanadas Comedia</p>
<div class="cursos-hero-foto">
<img src="/assets/img/espacio-jueves.webp" width="1200" height="1070" loading="eager" alt="Tres comediantes en el escenario de Tres Empanadas Comedia frente al público, mural Mondrian de fondo">
</div>
<p style="margin-top:var(--space-md);"><a class="btn-whatsapp" href="#opciones">Ver las opciones →</a></p>
</div>
</section>`;

// ── Mención seca del curso regular cuando NO está abierto (sin CTA, sin lista de espera) ──
const mencionCursoRegular = `
<section class="cursos-bloque">
<h2>Curso regular</h2>
<p>Cada tanto abrimos una edición del <strong>curso presencial</strong>: arranque y horario fijo, clases semanales y una estructura de principio a fin. La de 2026 ya empezó y no tiene lugares. La próxima es en 2027: <a href="https://aprendestandup.com.ar/avisame/?de=tresempanadas">dejá tu mail y te avisamos cuando abra</a>.</p>
</section>`;

const content = `
${hero}

<main class="cursos-main">

${estilos}

${avisoIntensivo}

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
<p>Y cuando querés, venís al club. No es una clase con lista y examen: es un espacio abierto donde trabajamos tu material con vos, en el punto en que estés. Hay quien viene cada jueves y hay quien viene cuando puede. Los dos tienen lugar.</p>
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
<span>Espacio abierto</span>
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
description: 'Curso de stand up en La Plata: presencial los jueves, online gratis u online con el espacio abierto de los jueves desde las 19:30 en Tres Empanadas Comedia. Elegí cómo empezar.',
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
