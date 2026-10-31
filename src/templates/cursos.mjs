/** Cursos — port de cursos/index.php */
import { page, esc } from './layout.mjs';
import { INTENSIVO, intensivoVigente, aperturaPendiente, scriptApertura } from '../lib/intensivo.mjs';

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
.op-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); margin-top: var(--space-md); text-align: left; }
.op { --light: #fffaf0; --paper: #fffdf8; background: #fff; border: 1px solid #e9dfcd; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 6px 20px rgba(80,50,20,.07); }
.op-top { position: relative; height: 128px; display: grid; place-items: center; color: var(--fg); background: radial-gradient(120% 90% at 50% 0%, var(--light) 0%, var(--bg) 60%); border-bottom: 1px solid var(--soft); }
.op-art { width: 100%; max-width: 260px; height: 112px; }
.op-chip { position: absolute; left: 14px; bottom: -13px; background: var(--paper); color: var(--fg); border: 1px solid var(--soft); font-size: .8rem; font-weight: 700; padding: 4px 11px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,.05); }
.op-n { position: absolute; right: 14px; top: 10px; font-family: var(--font-display); font-weight: 800; font-size: 1.6rem; opacity: .35; }
.op-body { padding: 24px 18px 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.op-body h3 { margin: 0; font-size: 1.15rem; line-height: 1.2; }
.op-body p { margin: 0; }
.op-body ul { list-style: none; margin: 2px 0 6px; padding: 0; font-size: .92rem; color: #444; }
.op-body li { display: flex; align-items: center; gap: 8px; padding: 2px 0; }
.op-body li svg { color: var(--rojo); flex: none; opacity: .85; }
.op-link { margin-top: auto; align-self: flex-start; color: var(--rojo); font-weight: 700; }
.op-form { margin-top: auto; display: flex; flex-direction: column; gap: 7px; background: var(--bg); border: 1px solid var(--soft); border-radius: 12px; padding: 12px; }
.op-form label { font-weight: 700; font-size: .85rem; color: var(--fg); }
.op-form input { font: inherit; font-size: .95rem; padding: 9px 11px; border: 1px solid var(--soft); border-radius: 8px; background: var(--paper); width: 100%; box-sizing: border-box; }
.op-form button { font: inherit; font-weight: 700; background: var(--rojo); color: #fff; border: 0; border-radius: 8px; padding: 10px; cursor: pointer; }
.op-form button:disabled { opacity: .6; }
.op-nota { font-size: .8rem; opacity: .7; text-align: center; margin-top: var(--space-md); }
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
<div class="cursos-horario"><span>El Rotativo Platense (<a href="/stand-up-la-plata/">show de stand up en La Plata</a>)</span><span class="cursos-horario__hora">21:30 hs</span></div>
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


// ── LAS CUATRO OPCIONES ──
// Tarjetas con ilustración (SVG en línea, sin imágenes externas). El taller
// lee fecha y precio de src/lib/intensivo.mjs; sin edición vigente muestra
// "Algunos feriados y sábados". Antes de INTENSIVO.abreDesde la fecha sale
// "a confirmar" y el navegador la cambia sola (scriptApertura).
const icoCal = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>`;
const icoPago = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.3c-.5-.8-1.4-1.3-2.5-1.3-1.5 0-2.5.8-2.5 1.9 0 2.7 5 1.4 5 4.2 0 1.1-1.1 1.9-2.5 1.9-1.1 0-2.1-.5-2.6-1.3M12 6.5V8M12 16v1.5"/></svg>`;
const icoReloj = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`;
const ART_TALLER = `<svg class="op-art" viewBox="0 0 240 120" aria-hidden="true"><circle cx="196" cy="30" r="14" fill="var(--soft)"/>
<path d="M120 4 L82 108 H158 Z" fill="var(--light)" opacity=".9"/>
<ellipse cx="120" cy="108" rx="46" ry="6" fill="var(--soft)"/>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="111" y="44" width="18" height="28" rx="9" fill="var(--paper)"/><path d="M105 64a15 15 0 0 0 30 0M120 79v26M110 105h20"/><path d="M114 52h12M114 58h12"/></g>
<g fill="currentColor" opacity=".55"><circle cx="58" cy="40" r="2.5"/><circle cx="44" cy="70" r="1.8"/><circle cx="176" cy="74" r="2"/></g></svg>`;
const ART_PRESENCIAL = `<svg class="op-art" viewBox="0 0 240 120" aria-hidden="true"><rect x="20" y="90" width="200" height="10" rx="5" fill="var(--soft)"/>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M40 40v46"/><path d="M40 66h18v20"/><path d="M43 44c4-1 6 1 6 4v14" opacity=".0"/></g><rect x="39" y="62" width="20" height="5" rx="2" fill="var(--paper)" stroke="currentColor" stroke-width="2"/><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M78 40v46"/><path d="M78 66h18v20"/><path d="M81 44c4-1 6 1 6 4v14" opacity=".0"/></g><rect x="77" y="62" width="20" height="5" rx="2" fill="var(--paper)" stroke="currentColor" stroke-width="2"/><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M116 40v46"/><path d="M116 66h18v20"/><path d="M119 44c4-1 6 1 6 4v14" opacity=".0"/></g><rect x="115" y="62" width="20" height="5" rx="2" fill="var(--paper)" stroke="currentColor" stroke-width="2"/>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="170" y="30" width="14" height="22" rx="7" fill="var(--paper)"/><path d="M165 46a12 12 0 0 0 24 0M177 58v28M168 86h18"/></g>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".6"><path d="M150 40l-8-6M150 52h-10"/></g></svg>`;
const ART_JUEVES = `<svg class="op-art" viewBox="0 0 240 120" aria-hidden="true"><rect x="150" y="84" width="74" height="16" rx="4" fill="var(--soft)"/>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="22" y="34" width="62" height="42" rx="5" fill="var(--paper)"/><path d="M14 84h78"/><path d="M32 46h30M32 54h40M32 62h22"/></g>
<path d="M92 56 C120 20, 150 20, 170 46" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M164 42l7 5 1-9"/></g>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="180" y="40" width="14" height="22" rx="7" fill="var(--paper)"/><path d="M175 56a12 12 0 0 0 24 0M187 68v16"/></g></svg>`;
const ART_ONLINE = `<svg class="op-art" viewBox="0 0 240 120" aria-hidden="true"><ellipse cx="110" cy="96" rx="70" ry="8" fill="var(--soft)"/>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M110 40c-14-8-34-9-50-4v54c16-5 36-4 50 4z" fill="var(--paper)"/><path d="M110 40c14-8 34-9 50-4v54c-16-5-36-4-50 4z" fill="var(--paper)"/><path d="M110 40v54"/>
<path d="M70 50c10-2 20-1 30 3M70 60c10-2 20-1 30 3M120 53c10-4 20-5 30-3M120 63c10-4 20-5 30-3"/></g>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M178 70h22v14a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" fill="var(--paper)"/><path d="M200 74h4a5 5 0 0 1 0 10h-4"/><path d="M185 60c-3-4 3-6 0-10M193 60c-3-4 3-6 0-10" opacity=".6"/></g></svg>`;

const pendienteOp = aperturaPendiente(now);
const fechaCap = INTENSIVO.fechaTexto ? INTENSIVO.fechaTexto[0].toUpperCase() + INTENSIVO.fechaTexto.slice(1) : '';
const itemsTaller = intensivoVigente(now)
  ? [[icoCal, pendienteOp
        ? `${esc(fechaCap)}<span data-int="pre"> · a confirmar</span>`
        : esc(fechaCap)],
     [icoReloj, esc(INTENSIVO.horario)],
     [icoPago, esc(INTENSIVO.precio)]]
  : [[icoCal, 'Algunos feriados y sábados']];

const op = (id, n, art, chip, tono, titulo, texto, items, cta) => `
<article class="op" id="${id}" style="${tono}">
<div class="op-top">${art}<span class="op-chip">${chip}</span><span class="op-n" aria-hidden="true">${n}</span></div>
<div class="op-body">
<h3>${titulo}</h3>
<p>${texto}</p>
<ul>${items.map(([i, t]) => `<li>${i}<span>${t}</span></li>`).join('')}</ul>
${cta}
</div>
</article>`;

const tresOpciones = `
<section class="cursos-bloque" id="opciones">
<h2>Elegí cómo empezar</h2>
<div class="op-grid">
${op('taller-inicial', 1, ART_TALLER, 'Una tarde · 4 hs', '--fg:#B33227;--bg:#fbe6e1;--soft:#f5d2cb',
  'Taller inicial intensivo',
  'Una tarde de 4 horas para arrancar desde cero con lo esencial. Si te gusta, seguís, a tu ritmo, en el espacio de los jueves (opción 3).',
  itemsTaller,
  '<a class="op-link" href="/intensivo/">Ver el taller →</a>')}
${op('presencial', 2, ART_PRESENCIAL, '4 meses', '--fg:#8a5a1c;--bg:#f6ecd8;--soft:#ead9b6',
  'Curso presencial',
  '4 meses, una clase por semana.',
  [[icoCal, 'Edición 2026 completa'], [icoCal, 'Próxima: 2027']],
  `<form class="op-form" onsubmit="return avisameCurso(event)">
<label for="aviso-email">Avisame del próximo</label>
<input name="nombre" autocomplete="name" placeholder="Tu nombre" maxlength="80" aria-label="Tu nombre">
<input id="aviso-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="Tu mail" required maxlength="120">
<input name="web" class="alt-trampa" tabindex="-1" autocomplete="off" aria-hidden="true">
<button type="submit">Avisame →</button>
<span class="alt-aviso-msg" role="status"></span>
</form>`)}
${op('online-practica', 3, ART_JUEVES, `Jueves ${PRACTICA_HORA}`, '--fg:#2f7a4f;--bg:#e4f1e8;--soft:#cde5d5',
  'Online + jueves en el club',
  'Leés online y los jueves traés lo tuyo al escenario.',
  [[icoCal, `Jueves desde las ${PRACTICA_HORA}`], [icoPago, 'A la gorra']],
  '<a class="op-link" href="https://aprendestandup.com.ar/los-jueves/">Cómo funciona →</a>')}
${op('online', 4, ART_ONLINE, 'Gratis', '--fg:#3d5a99;--bg:#e7ebf6;--soft:#d3dbef',
  'Por las tuyas',
  'Material online, a tu ritmo.',
  [[icoCal, 'Cuando quieras'], [icoPago, 'Gratis']],
  '<a class="op-link" href="https://aprendestandup.com.ar/notas/">Empezar →</a>')}
</div>
<p class="op-nota">Las opciones 3 y 4 te llevan a Aprende Stand Up, nuestra escuela online.</p>
${pendienteOp ? scriptApertura() : ''}
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
</section>`;

// ── AVISO DEL TALLER INICIAL (sólo con fecha confirmada: INTENSIVO.anunciarEnCursos) ──
const pendienteInt = aperturaPendiente(now);
const avisoIntensivo = ((INTENSIVO.anunciarEnCursos || pendienteInt) && intensivoVigente(now)) ? `
<section class="cursos-bloque curso-nuevo" id="taller-inicial-aviso"${pendienteInt ? ' data-int="post" style="display:none"' : ''}>
<span class="curso-nuevo__badge">Intensivo con lo esencial para arrancar</span>
<h2>Próximo taller inicial: ${esc(INTENSIVO.fechaTexto)}</h2>
<p>${esc(INTENSIVO.horario)} en Tres Empanadas. Una tarde para empezar, con teoría y práctica en el escenario.</p>
<p style="margin-top:var(--space-sm);"><a class="btn-whatsapp" href="/intensivo/">Ver el taller →</a></p>
</section>${pendienteInt ? scriptApertura() : ''}` : '';

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
<p>Cuatro formas de aprender stand up con Checho Falco. Arrancás desde donde estés.</p>
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
<span>El Rotativo Platense (<a href="/stand-up-la-plata/">show de stand up en La Plata</a>)</span>
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
