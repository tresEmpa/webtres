/** Página individual de evento — port de reservas/evento.php */
import { page, esc } from './layout.mjs';
import {
  fechaHumana, ucfirst, eventoFechasISO, eventoSchemaEstado, hoyISO,
} from '../lib/eventos.mjs';

const EXTRA = (lugar) => `
<section class="reservas-extra">
  <h3>Antes de venir</h3>
  <p>
    🎟️ <strong>La reserva es gratuita.</strong> El show es <strong>a la gorra</strong>: aportás lo que puedas al final.
    Aceptamos efectivo, tarjeta, QR y transferencia.
  </p>
  <p>
    🥟 Hay <strong>empanadas, cervezas artesanales tiradas, latas y opciones sin alcohol</strong>.
    <a href="/carta/" target="_blank" rel="noopener">Ver la carta</a>.
  </p>
  <p>
    ⭐ ¿Tenés dudas? Mirá lo que dice la gente en
    <a href="${esc(lugar.google_maps || 'https://share.google/dyTTJVXR25JTlU7kX')}"
       target="_blank" rel="noopener">Google Maps</a>.
  </p>

  <h3>Cómo llegar</h3>
  <p>
    Calle 43 N° 1349, esquina 22 — La Plata.
    Es la fachada violeta con las cortinas amarillas, no tiene pérdida.
  </p>

  <h3>Más info</h3>
  <p>🎭 Somos un <strong>microteatro</strong>, no un resto ni un bar gigante.</p>
  <p>✋ Se puede ver el show sin consumir.</p>
  <p>🙊 No siempre es el mismo show, tampoco cambia tanto.</p>
  <p>🌾 No tenemos menú sin TACC, pero podés traer tu propia comida.</p>
  <p>🔞 El humor y el ambiente son <strong>para adultos</strong>.</p>
  <p>
    🎂 ¿Querés festejar con tu grupo?
    <a href="https://wa.me/${esc(lugar.whatsapp || '542215247488')}?text=${encodeURIComponent('Hola! Consulta sobre festejos / grupos.')}"
       target="_blank" rel="noopener">Escribinos por WhatsApp</a>.
  </p>

  <h3>Aprendé stand-up</h3>
  <p>
    ¿Querés hacer reír? Tenemos cursos y coaching personalizados.
    Los <strong>jueves desde las 18hs hay taller libre</strong>.
  </p>
  <p>
    📝 <a href="/cursos/" target="_blank" rel="noopener">Ver próximo curso</a>
  </p>
</section>`;

const HORARIOS_CARD = `
  <div class="horarios-card" data-tep-estado="NORMAL SIN_FUNCION ULTIMA_HORA">
    <h3>Horarios de la noche</h3>
    <div class="semaforo">
      <div class="semaforo__row semaforo__row--verde">
        <span class="semaforo__dot" aria-hidden="true"></span>
        <span class="semaforo__hora">21:00</span>
        <span class="semaforo__label">Abrimos — vení tempranito</span>
      </div>
      <div class="semaforo__row semaforo__row--amarillo">
        <span class="semaforo__dot" aria-hidden="true"></span>
        <span class="semaforo__hora">21:30</span>
        <span class="semaforo__label">Bien, justito</span>
      </div>
      <div class="semaforo__row semaforo__row--naranja">
        <span class="semaforo__dot" aria-hidden="true"></span>
        <span class="semaforo__hora">21:45</span>
        <span class="semaforo__label">Vencen las reservas</span>
      </div>
      <div class="semaforo__row semaforo__row--rojo">
        <span class="semaforo__dot" aria-hidden="true"></span>
        <span class="semaforo__hora">22:01</span>
        <span class="semaforo__label">No se entra más</span>
      </div>
    </div>
  </div>`;

export function renderEvento(ev, lugar, year, now = new Date()) {
  const hoy = hoyISO(now);
  const esPasado = ev.fecha < hoy;
  const estado = ev.estado || 'activo';
  const color = ev.color || (ev.dia_semana === 'viernes' ? 'rojo' : 'violeta');
  const fechaH = fechaHumana(ev.fecha, false, now);
  const motivo = (ev.motivo_cancelacion || '').trim();

  const [isoStart, isoEnd] = eventoFechasISO(ev);
  const [schemaStatus, schemaAvail] = eventoSchemaEstado(estado);

  const wa = esc(lugar.whatsapp || '542215247488');

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.nombre_show,
    description: ev.descripcion || '',
    startDate: isoStart,
    endDate: isoEnd,
    eventStatus: schemaStatus,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: lugar.nombre || 'Tres Empanadas Comedia',
      address: {
        '@type': 'PostalAddress',
        streetAddress: lugar.direccion || 'Calle 43 N° 1349',
        addressLocality: lugar.ciudad || 'La Plata',
        addressRegion: lugar.provincia || 'Buenos Aires',
        postalCode: lugar.codigo_postal || 'B1902AFA',
        addressCountry: lugar.pais || 'AR',
      },
    },
    performer: (ev.elenco || []).map((p) => ({ '@type': 'Person', name: p })),
    organizer: {
      '@type': 'Organization',
      name: 'Tres Empanadas Comedia',
      url: 'https://tresempanadas.com.ar',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'ARS',
      availability: schemaAvail,
      url: `https://tresempanadas.com.ar/reservas/${ev.id}/`,
      validFrom: `${hoy}T00:00:00-03:00`,
    },
    typicalAgeRange: '18+',
    image: ev.flyer
      ? `https://tresempanadas.com.ar/data/flyers/${ev.flyer}`
      : 'https://tresempanadas.com.ar/assets/img/og-default.jpg',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://tresempanadas.com.ar/' },
      { '@type': 'ListItem', position: 2, name: 'Reservar', item: 'https://tresempanadas.com.ar/reservas/' },
      { '@type': 'ListItem', position: 3, name: ev.nombre_show, item: `https://tresempanadas.com.ar/reservas/${ev.id}/` },
    ],
  };

  const extraSchema =
    `<script type="application/ld+json">${JSON.stringify(eventSchema, null, 2)}</script>` +
    `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;

  const heroDesc = ev.descripcion
    ? `<p class="evento-hero__desc">${esc(ev.descripcion)}</p>` : '';
  const heroElenco = (ev.elenco && ev.elenco.length)
    ? `<div class="funcion-info__elenco"><strong>En escena</strong> ${esc(ev.elenco.join(' · '))}</div>` : '';
  const flyer = ev.flyer
    ? `
<section class="evento-flyer">
  <img src="/data/flyers/${esc(ev.flyer)}"
       alt="Flyer de ${esc(ev.nombre_show)} — ${esc(fechaH)}"
       loading="lazy">
</section>` : '';

  // --- Bloque central según estado ---
  let central = '';
  let formScript = '';

  if (estado === 'cancelado') {
    central = `
  <section class="evento-aviso evento-aviso--cancelado">
    <h2>Función cancelada</h2>
    <p>Esta función no se va a hacer. Si ya nos habías escrito, te respondemos por WhatsApp.</p>
    ${motivo ? `<div class="evento-aviso__motivo"><strong>Motivo:</strong> ${esc(motivo)}</div>` : ''}
    <a href="/reservas/" class="btn btn-primary">Ver otras funciones</a>
  </section>`;
  } else if (estado === 'agotado') {
    central = `
  <section class="evento-aviso evento-aviso--agotado">
    <h2>Localidades agotadas</h2>
    <p>Ya no tomamos reservas para este show. Si querés, anotate para alguna de las próximas funciones.</p>
    <a href="/reservas/" class="btn btn-primary">Ver próximas funciones</a>
  </section>`;
  } else if (estado === 'programado') {
    central = `
  <section class="evento-aviso evento-aviso--programado">
    <h2>Esta fecha ya está confirmada</h2>
    <p>Las reservas se abren la semana del show.</p>
    <a href="https://wa.me/${wa}?text=${encodeURIComponent('Hola! Avísame cuando se abran las reservas para ' + ev.nombre_show + ' del ' + fechaH + '.')}"
       target="_blank" rel="noopener"
       class="btn btn-primary">
      Avisame cuando abran →
    </a>
  </section>`;
  } else if (esPasado) {
    central = pasadoBlock();
  } else {
    // ACTIVO → formulario. Con guardia JS por si la fecha ya pasó al momento de abrir.
    central = `
  ${HORARIOS_CARD}

  <div id="evento-pasado-aviso" hidden>${pasadoBlock()}</div>

  <!-- ── ES LA NOCHE DEL SHOW, DE 20:00 A 22:00 ────────────────────────────
       Las reservas web ya no sirven: nadie las está mirando. Se ofrece el
       camino que sí funciona a esa hora, que es escribir por WhatsApp. -->
  <section class="evento-aviso tep-ultima-hora" data-tep-estado="ULTIMA_HORA">
    <span class="tep-ultima-hora__hora">Hoy · el show empieza ${esc(ev.hora)}</span>
    <h2>¿Estás sobre la hora?</h2>
    <p>Consultanos por WhatsApp si quedan lugares. Te contestamos al toque.</p>
    <a href="https://wa.me/${wa}?text=${encodeURIComponent('Hola! Estoy sobre la hora para ' + ev.nombre_show + ' de hoy. ¿Quedan lugares?')}"
       target="_blank" rel="noopener"
       class="btn btn-primary tep-btn-wsp" id="tep-wsp-ultima-hora">
      Consultar por WhatsApp →
    </a>
    <p class="reserva-form__note">
      Recordá: las reservas vencen 21:45 y después de las 22:01 no se entra más.
    </p>
  </section>

  <!-- ── YA CERRAMOS POR HOY (22:00 EN ADELANTE) ───────────────────────── -->
  <section class="evento-aviso tep-cerrado" data-tep-estado="CERRADO">
    <h2>Por hoy ya cerramos</h2>
    <p>Mirá las próximas funciones y reservá para la que te quede mejor.</p>
    <a href="/reservas/" class="btn btn-primary">Ver próximas funciones →</a>
  </section>

  <div data-tep-estado="NORMAL SIN_FUNCION">

  <form class="reserva-form" id="reserva-form" onsubmit="return enviarReserva(event)">
    <h3>Reservá tu mesa</h3>
    <p>Completá los datos y te abrimos WhatsApp con el mensaje listo para enviar.</p>

    <div class="reserva-form__campos">
      <div class="reserva-form__campo">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" required autocomplete="name">
      </div>

      <div class="reserva-form__campo">
        <label for="personas">Cantidad de personas <span class="reserva-form__hint">(máximo 6)</span></label>
        <input type="number" id="personas" name="personas" min="1" max="6" required inputmode="numeric"
               placeholder="¿Cuántos vienen?">
      </div>

      <p class="reserva-form__grupos">
        ¿Son más de 6?
        <a href="https://wa.me/${wa}?text=${encodeURIComponent('Hola! Somos un grupo de más de 6 personas y queremos ir al show ' + ev.nombre_show + ' (' + fechaH + '). ¿Cómo nos manejamos?')}"
           target="_blank" rel="noopener">
          Escribinos primero por WhatsApp →
        </a><br>
        <small>Para grupos grandes coordinamos aparte así nos aseguramos de que entren todos juntos.</small>
      </p>

      <div class="reserva-form__campo reserva-form__campo--full">
        <label for="mensaje">Mensaje (opcional)</label>
        <textarea id="mensaje" name="mensaje" placeholder="Alguna aclaración: cumple, sorpresa, etc."></textarea>
      </div>

      <div class="reserva-form__campo reserva-form__campo--full reserva-form__check">
        <label>
          <input type="checkbox" id="acepta" required>
          <span>Entiendo que las reservas vencen 21:45hs. Después de esa hora, mi mesa pasa a otra persona.</span>
        </label>
      </div>
    </div>

    <button type="submit" class="btn btn-primary reserva-form__submit">
      Reservar por WhatsApp →
    </button>

    <p class="reserva-form__note">No te suscribimos a nada. Sólo te abrimos el chat de WhatsApp.</p>
  </form>

  <div class="reserva-enviando" id="reserva-enviando" hidden>
    <h3>Enviando reserva<span class="dots"></span></h3>
    <p>Te abrimos WhatsApp y estamos registrando tu reserva. Un momento…</p>
  </div>

  <div class="reserva-exito" id="reserva-exito" hidden>
    <h3>✓ Reserva enviada</h3>
    <p>Te esperamos el <strong>${esc(fechaH)}</strong> a las ${esc(ev.hora)}hs en Calle 43 N° 1349, esquina 22.</p>
    <p>Si por alguna razón decidís cancelar, o sabés que no vas a poder venir, nos ayuda mucho que nos avises por WhatsApp. Muchas veces tenemos gente en espera.</p>
  </div>

  <div class="reserva-error" id="reserva-error" hidden>
    <h3>⚠ No pudimos registrar tu reserva</h3>
    <p>Mandanos el WhatsApp igual y te confirmamos por ahí.</p>
  </div>

  </div>`;

    formScript = `
<script>
// Guardia: si la función ya pasó (según el reloj del visitante), ocultar el formulario.
(function () {
  var fechaEvento = ${JSON.stringify(ev.fecha)};
  var hoyLocal = new Date();
  var ar = new Date(hoyLocal.getTime() - (hoyLocal.getTimezoneOffset() + 180) * 60000);
  var hoyStr = ar.toISOString().slice(0, 10);
  if (fechaEvento < hoyStr) {
    var form = document.getElementById('reserva-form');
    var horarios = document.querySelector('.horarios-card');
    var aviso = document.getElementById('evento-pasado-aviso');
    if (form) form.hidden = true;
    if (horarios) horarios.hidden = true;
    if (aviso) aviso.hidden = false;
  }
})();

function enviarReserva(e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const personas = parseInt(document.getElementById('personas').value, 10);
  const mensaje = document.getElementById('mensaje').value.trim();

  if (!nombre || !personas || personas < 1 || personas > 6) {
    alert('Para reservar de 1 a 6 personas. Si son más, escribinos primero por WhatsApp.');
    return false;
  }

  const showNombre = ${JSON.stringify(ev.nombre_show)};
  const fecha = ${JSON.stringify(fechaH)};
  const eventoId = ${JSON.stringify(ev.id)};
  const eventoFecha = ${JSON.stringify(ev.fecha)};

  const personasText = personas === 1 ? '1 persona' : personas + ' personas';

  let msg = \`Hola! Quiero reservar para \${showNombre} (\${fecha}).\\n\\n\`;
  msg += \`Nombre: \${nombre}\\n\`;
  msg += \`Personas: \${personasText}\\n\`;
  if (mensaje) msg += \`\\n\${mensaje}\`;

  try {
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', { 'send_to': 'AW-11304999909/reserva_whatsapp' });
    }
  } catch (_) {}
  // Mismo evento estándar Lead que los otros caminos de reserva; lo que los
  // distingue es content_category.
  try {
    if (window.TEP) {
      TEP.track(
        'Lead',
        { content_name: showNombre, content_category: 'reserva_web', num_items: personas },
        'generate_lead',
        { content_name: showNombre, content_category: 'reserva_web', num_items: personas }
      );
    }
  } catch (_) {}

  // Ya reservó: que el reloj no le cambie la página abajo de los pies si justo
  // dan las 20:00 mientras lee la confirmación.
  window.TEP_CONGELADO = true;

  const $form     = document.getElementById('reserva-form');
  const $enviando = document.getElementById('reserva-enviando');
  const $exito    = document.getElementById('reserva-exito');
  const $error    = document.getElementById('reserva-error');

  $form.hidden = true;
  $enviando.hidden = false;
  $enviando.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const url = \`https://wa.me/${wa}?text=\${encodeURIComponent(msg)}\`;
  window.open(url, '_blank');

  const payload = new FormData();
  payload.append('evento_id', eventoId);
  payload.append('evento_fecha', eventoFecha);
  payload.append('evento_nombre', showNombre);
  payload.append('nombre', nombre);
  payload.append('personas', personasText);
  payload.append('mensaje', mensaje);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  fetch('/reservas/registrar', { method: 'POST', body: payload, signal: controller.signal })
    .then(r => r.json().then(data => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      clearTimeout(timeoutId);
      $enviando.hidden = true;
      if (ok && data && data.ok) {
        $exito.hidden = false;
        $exito.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        $error.hidden = false;
        $error.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    })
    .catch(() => {
      clearTimeout(timeoutId);
      $enviando.hidden = true;
      $error.hidden = false;
      $error.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

  return false;
}
</script>`;
  }

  // Medición común a toda página de función, tenga formulario o no.
  const trackScript = `
<script>
(function () {
  if (!window.TEP) return;
  var show = ${JSON.stringify(ev.nombre_show)};
  var evId = ${JSON.stringify(ev.id)};

  // Vio la función.
  TEP.track('ViewContent', { content_name: show, content_category: 'funcion' },
            'view_item',    { content_name: show, content_category: 'funcion' });

  // Empezó a completar el formulario: primer foco en cualquier campo, una sola
  // vez por sesión y por función.
  var form = document.getElementById('reserva-form');
  if (form) {
    var arrancoCheckout = function () {
      TEP.unaVez('checkout:' + evId, function () {
        TEP.track('InitiateCheckout', { content_name: show },
                  'begin_checkout',   { content_name: show });
      });
    };
    form.addEventListener('focusin', arrancoCheckout, { once: true });
  }

  // Consultó por WhatsApp estando sobre la hora. Mismo Lead, otra categoría.
  // Sin preventDefault: el link abre en pestaña nueva y la página no se
  // descarga, así que al evento le sobra tiempo para salir.
  var wspUltima = document.getElementById('tep-wsp-ultima-hora');
  if (wspUltima) {
    wspUltima.addEventListener('click', function () {
      window.TEP_CONGELADO = true;
      TEP.track('Lead',        { content_name: show, content_category: 'reserva_ultima_hora' },
                'generate_lead', { content_name: show, content_category: 'reserva_ultima_hora' });
    });
  }
})();
</script>`;

  const content = `
<section class="evento-hero">
  <div class="container">
    <a href="/reservas/" class="evento-hero__back">← Todas las funciones</a>

    <span class="funcion-info__day-badge funcion-info__day-badge--${esc(color)}">
      ${esc(ucfirst(ev.dia_semana))} ${esc(ev.hora)}
    </span>

    <h1>${esc(ev.nombre_show)}</h1>
    <p class="evento-hero__fecha">${esc(fechaH)}</p>

    ${heroDesc}
    ${heroElenco}
  </div>
</section>
${flyer}
${central}
${EXTRA(lugar)}
${formScript}
${trackScript}
`;

  return page({
    title: `${ev.nombre_show} — ${fechaH} | Tres Empanadas Comedia`,
    description: (ev.descripcion || '') || 'Stand up en La Plata. Reservá gratis tu mesa.',
    url: `https://tresempanadas.com.ar/reservas/${ev.id}/`,
    image: ev.flyer
      ? `https://tresempanadas.com.ar/data/flyers/${ev.flyer}`
      : 'https://tresempanadas.com.ar/assets/img/og-default.jpg',
    bodyClass: `page-evento page-evento--${color}`,
    extraCss: '/assets/css/reservas.css',
    extraSchema,
    currentPath: `/reservas/${ev.id}/`,
    // Sólo la fecha de ESTA función: el jueves a las 21:10 se apaga la página
    // del jueves, no la del viernes que viene.
    funciones: formScript ? [ev.fecha] : null,
    content,
    year,
  });
}

function pasadoBlock() {
  return `
  <section class="evento-aviso">
    <h2>Esta función ya pasó</h2>
    <p>Te esperamos en la próxima.</p>
    <a href="/reservas/" class="btn btn-primary">Ver próximas funciones</a>
  </section>`;
}
