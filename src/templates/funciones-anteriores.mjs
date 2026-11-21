/**
 * /funciones-anteriores/ — archivo de las funciones del último año.
 *
 * Existe para que las páginas de funciones pasadas sigan teniendo un enlace
 * interno: sin él, Google las trata como huérfanas y las descarta aunque estén
 * en el sitemap. De paso deja en el sitio quién pasó por el escenario.
 */
import { page, esc } from './layout.mjs';
import { fechaHumana } from '../lib/eventos.mjs';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** `eventos`: pasados del último año, más reciente primero. */
export function renderFuncionesAnteriores(eventos, year, now = new Date()) {
  const porMes = new Map();
  for (const ev of eventos) {
    const clave = ev.fecha.slice(0, 7);
    if (!porMes.has(clave)) porMes.set(clave, []);
    porMes.get(clave).push(ev);
  }

  const bloques = [...porMes].map(([clave, evs]) => {
    const [a, m] = clave.split('-');
    const items = evs.map((ev) => {
      const elenco = (ev.elenco || []).filter(Boolean);
      return `
      <li class="archivo__item">
        <a href="/reservas/${esc(ev.id)}/">${esc(ev.nombre_show)}</a>
        <span class="archivo__fecha">${esc(fechaHumana(ev.fecha, true, now))}</span>
        ${elenco.length ? `<span class="archivo__elenco">${esc(elenco.join(' · '))}</span>` : ''}
      </li>`;
    }).join('');
    return `
    <section class="archivo__mes">
      <h2>${MESES[+m - 1]} ${a}</h2>
      <ul>${items}
      </ul>
    </section>`;
  }).join('');

  const nombres = new Set(eventos.flatMap((ev) => (ev.elenco || []).filter(Boolean)));

  const content = `
<style>
.archivo { max-width: 760px; margin: 0 auto; padding: var(--space-xl) var(--space-md); }
.archivo h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: var(--space-sm); }
.archivo__intro { color: var(--gris-text); margin-bottom: var(--space-lg); }
.archivo__mes { margin-bottom: var(--space-lg); }
.archivo__mes h2 { font-size: 1.25rem; text-transform: capitalize; margin-bottom: var(--space-sm); }
.archivo__mes ul { list-style: none; padding: 0; margin: 0; }
.archivo__item { padding: .6rem 0; border-bottom: 1px solid rgba(0,0,0,.08); display: flex; flex-direction: column; gap: .15rem; }
.archivo__item a { font-weight: 700; }
.archivo__fecha, .archivo__elenco { font-size: .95rem; color: var(--gris-text); }
</style>
<div class="archivo">
  <h1>Funciones anteriores</h1>
  <p class="archivo__intro">
    Las funciones de stand up del último año en Tres Empanadas, 43 y 22, La Plata.
    ${nombres.size ? `Pasaron ${nombres.size} comediantes por el escenario.` : ''}
    <a href="/reservas/">Ver las próximas funciones →</a>
  </p>
${bloques || '<p>Todavía no hay funciones en el archivo.</p>'}
</div>
`;

  return page({
    title: 'Funciones anteriores de stand up en La Plata | Tres Empanadas',
    description: 'Archivo de las funciones de stand up del último año en Tres Empanadas Comedia, 43 y 22, La Plata: fechas, shows y comediantes.',
    url: 'https://tresempanadas.com.ar/funciones-anteriores/',
    bodyClass: 'page-archivo',
    currentPath: '/funciones-anteriores/',
    content,
    year,
  });
}
