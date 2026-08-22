/**
 * cliente.mjs — Lo que corre en el navegador: estado de la noche + medición.
 *
 * Dos cosas viven acá:
 *
 *  1) ESTADO DE LA NOCHE. Los días de función el sitio cambia solo: a las 20:00
 *     esconde el formulario y ofrece WhatsApp, a las 22:00 avisa que ya cerró.
 *     Se calcula SIEMPRE en hora de Argentina y SIEMPRE en el navegador, en cada
 *     carga. No se puede resolver en el build: Cloudflare cachea el HTML y a las
 *     tres horas estaría sirviendo un estado viejo.
 *
 *  2) MEDICIÓN. Un solo helper (window.TEP) que dispara el mismo evento estándar
 *     a Meta y a Google, con un eventID único por disparo.
 *
 * Los templates importan de acá los bloques <style> y <script> ya armados.
 */

// ══════════════════════════════════════════════════════════════════════
//  CONSTANTES — TOCAR ACÁ Y EN NINGÚN OTRO LADO
// ══════════════════════════════════════════════════════════════════════

/** A esta hora (día de función) se apaga el formulario y aparece WhatsApp. */
export const HORA_ULTIMA_HORA = 20;   // 20:00

/** A esta hora (día de función) pasa a "por hoy ya cerramos". */
export const HORA_CIERRE = 22;        // 22:00

/** Zona horaria de referencia. El reloj del visitante nunca decide. */
export const ZONA = 'America/Argentina/Buenos_Aires';

/** WhatsApp del local (sin +, formato wa.me). */
export const WHATSAPP = '542215247488';

/**
 * ID de Google Analytics 4. Empieza con "G-".
 * ⚠ HOY ESTÁ VACÍO: el sitio tiene gtag cargado sólo para Google Ads
 * (AW-11304999909), que NO es lo mismo que Analytics. Mientras esto esté vacío
 * los eventos igual se disparan, pero ninguna propiedad de Analytics los recibe.
 * Se saca de analytics.google.com → Administrar → Flujos de datos.
 */
export const GA4_ID = '';

// ══════════════════════════════════════════════════════════════════════
//  1) ESTADO DE LA NOCHE
// ══════════════════════════════════════════════════════════════════════

/**
 * CSS que evita el parpadeo.
 *
 * Por defecto sólo se ve lo marcado como NORMAL, así que si alguien tiene el JS
 * apagado ve el formulario de siempre y no un sitio roto. El script de <head>
 * corre antes de que el navegador pinte el <body>, así que cuando la noche no es
 * NORMAL el formulario no llega a verse ni un instante.
 */
export const ESTADO_CSS = `
  <style>
    /* Antes de que corra el script (y si el JS está apagado) se ve sólo lo
       marcado NORMAL, que es el sitio de siempre. */
    [data-tep-estado]:not([data-tep-estado~="NORMAL"]) { display: none; }

    /* Ya resuelto: se muestra lo del estado vigente y se esconde todo lo demás.
       Un bloque puede pertenecer a varios estados (ej. "NORMAL SIN_FUNCION"). */
    html[data-tep-noche="NORMAL"]      [data-tep-estado]:not([data-tep-estado~="NORMAL"]),
    html[data-tep-noche="ULTIMA_HORA"] [data-tep-estado]:not([data-tep-estado~="ULTIMA_HORA"]),
    html[data-tep-noche="CERRADO"]     [data-tep-estado]:not([data-tep-estado~="CERRADO"]),
    html[data-tep-noche="SIN_FUNCION"] [data-tep-estado]:not([data-tep-estado~="SIN_FUNCION"]) { display: none; }

    html[data-tep-noche="ULTIMA_HORA"] [data-tep-estado~="ULTIMA_HORA"],
    html[data-tep-noche="CERRADO"]     [data-tep-estado~="CERRADO"],
    html[data-tep-noche="SIN_FUNCION"] [data-tep-estado~="SIN_FUNCION"]:not([data-tep-estado~="NORMAL"]) { display: block; }

    .tep-ultima-hora  { border-color: var(--sem-naranja, #FF9800); }
    .tep-ultima-hora h2,
    .tep-cerrado h2   { color: var(--rojo, #B33227); }
    .tep-ultima-hora__hora {
      display: inline-block;
      margin-bottom: var(--space-sm, 1rem);
      font-family: var(--font-display, sans-serif);
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--rojo-tinto, #6E1F18);
      background: var(--dorado, #D9B76A);
      border-radius: 999px;
      padding: 4px 14px;
    }
    .tep-btn-wsp { background: #25D366 !important; border-color: #1EA952 !important; color: #fff !important; }
  </style>`;

/**
 * Script de <head> que resuelve el estado antes de pintar la página.
 *
 * Ojo con qué se le pasa: el estado aplica sólo si HOY está en esta lista.
 *  · Página de una función  → se le pasa SÓLO la fecha de esa función, así el
 *    jueves a las 21:10 se apaga la página del jueves y no la del viernes que
 *    viene, que puede seguir tomando reservas sin molestar a nadie.
 *  · Listado /reservas/     → se le pasan todas las fechas de la cartelera.
 *
 * @param {string[]} funciones  Fechas 'YYYY-MM-DD' con función, en el orden que sea.
 * @param {boolean}  refrescar  Si true, corrige la lista contra /data/agenda.json.
 */
export function estadoScript(funciones, refrescar = true) {
  const lista = JSON.stringify(Array.from(new Set(funciones)).sort());
  return `
  <script>
  (function () {
    var ULTIMA_HORA = ${HORA_ULTIMA_HORA};
    var CIERRE      = ${HORA_CIERRE};
    var ZONA        = ${JSON.stringify(ZONA)};

    // Fechas en las que este bloque tiene que reaccionar. Escritas en el build.
    var funciones = ${lista};

    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: ZONA, hourCycle: 'h23', hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { fmt = null; }

    // Hora de Argentina, nunca la del dispositivo.
    function ahoraAR() {
      if (!fmt) {
        // Sin Intl (navegador muy viejo): Argentina es UTC-3 fijo desde 2009.
        var d = new Date(Date.now() - 3 * 3600000);
        return {
          fecha: d.toISOString().slice(0, 10),
          minutos: d.getUTCHours() * 60 + d.getUTCMinutes()
        };
      }
      var p = {};
      fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var h = parseInt(p.hour, 10) % 24;
      return {
        fecha: p.year + '-' + p.month + '-' + p.day,
        minutos: h * 60 + parseInt(p.minute, 10)
      };
    }

    function calcular() {
      var t = ahoraAR();
      if (funciones.indexOf(t.fecha) === -1) return 'SIN_FUNCION';
      if (t.minutos >= CIERRE * 60) return 'CERRADO';
      if (t.minutos >= ULTIMA_HORA * 60) return 'ULTIMA_HORA';
      return 'NORMAL';
    }

    function aplicar() {
      // Si alguien ya mandó la reserva, no le movemos la página abajo de los pies
      // porque justo dieron las 20:00.
      if (window.TEP_CONGELADO) return window.TEP_ESTADO;
      var estado = calcular();
      var html = document.documentElement;
      if (html.getAttribute('data-tep-noche') !== estado) {
        html.setAttribute('data-tep-noche', estado);
      }
      window.TEP_ESTADO = estado;
      return estado;
    }

    aplicar();

    // El estado cambia con el reloj aunque nadie recargue: alguien que dejó la
    // pestaña abierta a las 19:55 tiene que ver el cambio a las 20:00.
    setInterval(aplicar, 30000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) aplicar();
    });

${refrescar ? `    // Fuente de verdad de los días de función: la misma agenda que genera
    // /reservas/. Si este HTML venía cacheado, esto lo corrige.
    function refrescarAgenda() {
      if (typeof fetch !== 'function') return;
      fetch('/data/agenda.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (agenda) {
          if (!agenda || !agenda.length) return;
          var nuevas = [];
          for (var i = 0; i < agenda.length; i++) {
            var ev = agenda[i];
            if (ev && ev.fecha && ev.estado !== 'cancelado') nuevas.push(ev.fecha);
          }
          if (nuevas.length) { funciones = nuevas; aplicar(); }
        })
        .catch(function () {});
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', refrescarAgenda);
    } else {
      refrescarAgenda();
    }
` : ''}  })();
  </script>`;
}

// ══════════════════════════════════════════════════════════════════════
//  2) MEDICIÓN
// ══════════════════════════════════════════════════════════════════════

/**
 * window.TEP — helper de eventos, disponible en todas las páginas.
 *
 * Criterio: todos los caminos de reserva disparan el MISMO evento estándar
 * (Lead), diferenciados por content_category. Partirlos en eventos
 * personalizados distintos fragmentaría la señal con la que optimiza Meta.
 *
 * Nunca se manda nombre, teléfono ni nada personal del que reserva: sólo el
 * nombre del show y la cantidad de personas.
 */
export const TRACKING_JS = `
  <script>
  (function () {
    var TEP = window.TEP = window.TEP || {};

    TEP.uuid = function () {
      try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
      try {
        if (window.crypto && crypto.getRandomValues) {
          var b = crypto.getRandomValues(new Uint8Array(16));
          b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
          var h = []; for (var i = 0; i < 16; i++) h.push((b[i] + 0x100).toString(16).slice(1));
          return h.slice(0,4).join('') + '-' + h.slice(4,6).join('') + '-' + h.slice(6,8).join('')
               + '-' + h.slice(8,10).join('') + '-' + h.slice(10,16).join('');
        }
      } catch (e) {}
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    /**
     * Dispara el mismo hecho a Meta y a Google.
     * El eventID todavía no se usa, pero el día que sumemos la API de
     * Conversiones desde el servidor evita que Meta cuente dos veces.
     */
    TEP.track = function (fbEvento, fbParams, gaEvento, gaParams) {
      var eventID = TEP.uuid();
      try {
        if (typeof fbq === 'function') fbq('track', fbEvento, fbParams || {}, { eventID: eventID });
      } catch (e) {}
      try {
        if (typeof gtag === 'function') {
          var g = { transport_type: 'beacon', event_id: eventID };
          var src = gaParams || fbParams || {};
          for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) g[k] = src[k];
          gtag('event', gaEvento, g);
        }
      } catch (e) {}
      return eventID;
    };

    /** Corre fn una sola vez por sesión y por clave. */
    TEP.unaVez = function (clave, fn) {
      try {
        if (sessionStorage.getItem('tep:' + clave)) return;
        sessionStorage.setItem('tep:' + clave, '1');
      } catch (e) {
        if (TEP['_' + clave]) return;
        TEP['_' + clave] = 1;
      }
      fn();
    };
  })();
  </script>`;

/** Listener del botón flotante de WhatsApp — vive en el layout, en todas las páginas. */
export const WSP_FLOTANTE_JS = `
  <script>
  (function () {
    var boton = document.querySelector('.whatsapp-float');
    if (!boton) return;
    // Sin preventDefault: el link abre en pestaña nueva, la página no se
    // descarga y al evento le sobra tiempo para salir.
    boton.addEventListener('click', function () {
      if (window.TEP) TEP.track('Contact', { content_category: 'wsp_flotante' },
                                'contact',  { content_category: 'wsp_flotante' });
    });
  })();
  </script>`;
