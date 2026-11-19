/**
 * Tarjeta "Próxima función" del hero de la home (sólo desktop).
 *
 * Por qué no es un botón más: la cabecera ya tiene "Reservar". Esta tarjeta
 * suma lo que el botón no dice — qué show hay y cuándo — y ahí está la duda
 * real del que todavía no decidió.
 *
 * Cloudflare cachea el HTML y el sitio sólo se rebuildea con cada push, así
 * que la función que eligió el build puede quedar vieja. Por eso se incrustan
 * las próximas y el navegador elige, en hora de Argentina, la primera que
 * todavía no cerró (corte a HORA_CIERRE del día de la función). Sin JS queda
 * la que eligió el build.
 */
import { esc } from './layout.mjs';
import { fechaHumana, ucfirst } from '../lib/eventos.mjs';
import { HORA_CIERRE, ZONA } from '../lib/cliente.mjs';

const MAX = 8;

function datos(ev, now) {
  const programado = ev.estado === 'programado';
  return {
    id: ev.id,
    fecha: ev.fecha,
    hora: ev.hora || '21:30',
    show: ev.nombre_show || '',
    cuando: ucfirst(fechaHumana(ev.fecha, false, now)),
    cta: programado ? 'Ver función →' : 'Reservar →',
  };
}

export function proximaFuncion(listado, now = new Date()) {
  const lista = listado
    .filter((ev) => ['activo', 'programado'].includes(ev.estado || 'activo'))
    .slice(0, MAX)
    .map((ev) => datos(ev, now));

  if (!lista.length) return '';
  const f = lista[0];

  return `
    <a class="proxima-funcion" id="proxima-funcion" href="/reservas/${esc(f.id)}/"
       data-atajo="atajo_hero">
      <span class="proxima-funcion__label" data-pf="label">Próxima función</span>
      <span class="proxima-funcion__cuando" data-pf="cuando">${esc(f.cuando)}</span>
      <span class="proxima-funcion__hora"><span data-pf="hora">${esc(f.hora)}</span> hs</span>
      <span class="proxima-funcion__show" data-pf="show">${esc(f.show)}</span>
      <span class="proxima-funcion__cta" data-pf="cta">${esc(f.cta)}</span>
    </a>
    <script>
    (function () {
      var lista = ${JSON.stringify(lista).replace(/</g, '\\u003c')};
      var el = document.getElementById('proxima-funcion');
      if (!el) return;
      var hoy, min;
      try {
        var p = {};
        new Intl.DateTimeFormat('en-CA', {
          timeZone: ${JSON.stringify(ZONA)}, hourCycle: 'h23',
          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
        hoy = p.year + '-' + p.month + '-' + p.day;
        min = (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10);
      } catch (e) {
        var d = new Date(Date.now() - 3 * 3600000);
        hoy = d.toISOString().slice(0, 10);
        min = d.getUTCHours() * 60 + d.getUTCMinutes();
      }
      var f = null;
      for (var i = 0; i < lista.length; i++) {
        var x = lista[i];
        if (x.fecha > hoy || (x.fecha === hoy && min < ${HORA_CIERRE} * 60)) { f = x; break; }
      }
      if (!f) { el.hidden = true; return; }
      function set(k, v) { var n = el.querySelector('[data-pf="' + k + '"]'); if (n) n.textContent = v; }
      el.href = '/reservas/' + f.id + '/';
      set('label', f.fecha === hoy ? 'Hoy hay función' : 'Próxima función');
      set('cuando', f.fecha === hoy ? 'Hoy, ' + f.cuando.split(' de ')[0].toLowerCase() : f.cuando);
      set('hora', f.hora);
      set('show', f.show);
      set('cta', f.cta);
    })();
    </script>`;
}
