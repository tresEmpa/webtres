/**
 * Plantillas HTML del panel de administración (cocina).
 * Port de cocina/index.php, panel.php, editar.php, borrar.php y lib/header.php.
 */

import { fechaHumana, ucfirst } from './eventos.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function layout(title, body, { loggedIn = false } = {}) {
  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${esc(title)} · Cocina · Tres Empanadas</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#B33227">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/cocina.css">
</head>
<body class="cocina">

<header class="cocina-header">
  <a href="/cocina/panel" class="cocina-header__brand">
    Cocina
    <small>Tres Empanadas</small>
  </a>
  ${loggedIn ? `<div class="cocina-header__user"><a href="/cocina/logout">Salir</a></div>` : ''}
</header>

${body}

</body>
</html>`;
}

export function loginPage({ error, csrf, next }) {
  const body = `
<div class="cocina-login">
  <h1 class="cocina-login__title">Cocina · Tres Empanadas</h1>

  ${error ? `<div class="cocina-flash cocina-flash--err">${esc(error)}</div>` : ''}

  <form method="post" class="cocina-form" autocomplete="off" action="/cocina/login">
    <input type="hidden" name="_csrf" value="${esc(csrf)}">
    <input type="hidden" name="next" value="${esc(next || '/cocina/panel')}">

    <div class="cocina-field">
      <label for="user">Usuario</label>
      <input type="text" id="user" name="user" required autocomplete="username">
    </div>

    <div class="cocina-field">
      <label for="pass">Contraseña</label>
      <input type="password" id="pass" name="pass" required autocomplete="current-password">
    </div>

    <button type="submit" class="btn-cocina btn-cocina--primary btn-cocina--block">Entrar</button>
  </form>
</div>`;
  return layout('Entrar', body, { loggedIn: false });
}

function eventoCard(ev, { pasado = false } = {}) {
  const color = ev.color || (ev.dia_semana === 'viernes' ? 'rojo' : 'violeta');
  const estado = ev.estado || 'activo';
  if (pasado) {
    return `
      <div class="cocina-evento cocina-evento--${esc(color)} cocina-evento--pasado">
        <div class="cocina-evento__body">
          <p class="cocina-evento__fecha">${esc(fechaHumana(ev.fecha, true))}</p>
          <p class="cocina-evento__titulo">${esc(ev.nombre_show)}</p>
        </div>
        <div class="cocina-evento__actions">
          <a href="/cocina/editar?id=${esc(ev.id)}" class="btn-cocina btn-cocina--ghost btn-cocina--sm">Ver / editar</a>
        </div>
      </div>`;
  }
  const elenco = (ev.elenco && ev.elenco.length)
    ? `<span>${esc(ev.elenco.slice(0, 3).join(' · '))}</span>` : '';
  return `
      <div class="cocina-evento cocina-evento--${esc(color)}">
        <div class="cocina-evento__body">
          <p class="cocina-evento__fecha">${esc(fechaHumana(ev.fecha))} · ${esc(ev.hora)}hs</p>
          <p class="cocina-evento__titulo">${esc(ev.nombre_show)}</p>
          <p class="cocina-evento__meta">
            <span class="cocina-evento__estado cocina-evento__estado--${esc(estado)}">${esc(estado)}</span>
            ${elenco}
          </p>
        </div>
        <div class="cocina-evento__actions">
          <a href="/reservas/${esc(ev.id)}/" target="_blank" rel="noopener" class="btn-cocina btn-cocina--ghost btn-cocina--sm" title="Ver en el sitio">Ver</a>
          <a href="/cocina/editar?id=${esc(ev.id)}" class="btn-cocina btn-cocina--primary btn-cocina--sm">Editar</a>
        </div>
      </div>`;
}

export function panelPage({ proximos, pasados, flash, flashType }) {
  const flashHtml = flash
    ? `<div class="cocina-flash cocina-flash--${esc(flashType || 'ok')}">${esc(flash)}</div>` : '';

  let proximosHtml;
  if (!proximos.length) {
    proximosHtml = `
    <div class="cocina-empty">
      <p>No hay funciones cargadas todavía.</p>
      <a href="/cocina/editar" class="btn-cocina btn-cocina--primary">+ Nuevo evento</a>
    </div>`;
  } else {
    proximosHtml = proximos.map((ev) => eventoCard(ev)).join('\n');
  }

  const pasadosHtml = pasados.length ? `
    <hr class="cocina-divider">
    <h2 class="cocina-title">Últimas funciones pasadas</h2>
    ${pasados.map((ev) => eventoCard(ev, { pasado: true })).join('\n')}` : '';

  const fab = proximos.length ? `<a href="/cocina/editar" class="cocina-fab">+ Nuevo evento</a>` : '';

  const body = `
<div class="cocina-wrap">
  ${flashHtml}
  <h1 class="cocina-title">Próximas funciones</h1>
  ${proximosHtml}
  ${pasadosHtml}
</div>
${fab}`;
  return layout('Panel', body, { loggedIn: true });
}

export function editarPage({ ev, plantillas, idOriginal, csrf, errores }) {
  const elencoText = Array.isArray(ev.elenco) ? ev.elenco.join('\n') : '';
  const erroresHtml = (errores && errores.length) ? `
    <div class="cocina-flash cocina-flash--err">
      <strong>Revisá esto:</strong>
      <ul style="margin: 0.25rem 0 0 1.25rem; padding: 0;">
        ${errores.map((e) => `<li>${esc(e)}</li>`).join('')}
      </ul>
    </div>` : '';

  const plantillaField = (!idOriginal && plantillas && Object.keys(plantillas).length) ? `
      <div class="cocina-field">
        <label for="plantilla_select">Plantilla <span class="opt">(opcional, auto-rellena los campos)</span></label>
        <select id="plantilla_select" name="plantilla">
          <option value="">— Empezar en blanco —</option>
          ${Object.entries(plantillas).map(([k, p]) => `<option value="${esc(k)}">${esc(p.nombre_plantilla)}</option>`).join('')}
        </select>
        <p class="cocina-field__hint">Elegí una y los campos se completan solos. Después podés editar lo que cambie.</p>
      </div>`
    : `<input type="hidden" name="plantilla" value="${esc(ev.plantilla || '')}">`;

  const flyerBlock = ev.flyer ? `
        <img src="/data/flyers/${esc(ev.flyer)}?v=${Date.now()}" alt="Flyer actual" class="cocina-flyer-preview">
        <div class="cocina-flyer-actions">
          <label style="display:flex;align-items:center;gap:0.5rem;font-weight:400;text-transform:none;letter-spacing:0;margin:0;">
            <input type="checkbox" name="quitar_flyer" value="1"> Quitar flyer actual
          </label>
        </div>` : '';

  const borrarBtn = idOriginal
    ? `<a href="/cocina/borrar?id=${esc(idOriginal)}" class="btn-cocina btn-cocina--danger">Borrar</a>` : '';

  const body = `
<div class="cocina-wrap">
  <h1 class="cocina-title">${idOriginal ? 'Editar evento' : 'Nuevo evento'}</h1>
  ${erroresHtml}

  <form method="post" enctype="multipart/form-data" class="cocina-form" id="form-evento" action="/cocina/editar${idOriginal ? `?id=${esc(idOriginal)}` : ''}">
    <input type="hidden" name="_csrf" value="${esc(csrf)}">

    ${plantillaField}

    <div class="cocina-field__row">
      <div class="cocina-field">
        <label for="fecha">Fecha</label>
        <input type="date" id="fecha" name="fecha" required value="${esc(ev.fecha || '')}">
      </div>
      <div class="cocina-field">
        <label for="hora">Hora</label>
        <input type="time" id="hora" name="hora" value="${esc(ev.hora || '21:30')}" step="900">
      </div>
    </div>

    <div class="cocina-field">
      <label for="nombre_show">Nombre del show</label>
      <input type="text" id="nombre_show" name="nombre_show" required maxlength="120" value="${esc(ev.nombre_show || '')}">
    </div>

    <div class="cocina-field">
      <label for="descripcion">Descripción</label>
      <textarea id="descripcion" name="descripcion" maxlength="600">${esc(ev.descripcion || '')}</textarea>
      <p class="cocina-field__hint">Lo que aparece en la página del evento y en Google. Máx 600 caracteres.</p>
    </div>

    <div class="cocina-field">
      <label for="elenco">Elenco <span class="opt">(uno por línea)</span></label>
      <textarea id="elenco" name="elenco" placeholder="Checho Falco&#10;Rubén Vaena&#10;Julián Dorati">${esc(elencoText)}</textarea>
    </div>

    <div class="cocina-field__row">
      <div class="cocina-field">
        <label for="estado">Estado</label>
        <select id="estado" name="estado">
          <option value="activo"     ${ev.estado === 'activo' ? 'selected' : ''}>Activo — toma reservas</option>
          <option value="programado" ${ev.estado === 'programado' ? 'selected' : ''}>Programado — confirmado pero sin reservas todavía</option>
          <option value="agotado"    ${ev.estado === 'agotado' ? 'selected' : ''}>Agotado</option>
          <option value="cancelado"  ${ev.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </div>
      <div class="cocina-field">
        <label for="duracion_minutos">Duración <span class="opt">(min)</span></label>
        <input type="number" id="duracion_minutos" name="duracion_minutos" min="10" max="600" value="${parseInt(ev.duracion_minutos ?? 90, 10)}">
      </div>
    </div>

    <div class="cocina-field" id="motivo-cancelacion-wrap" style="${ev.estado === 'cancelado' ? '' : 'display:none;'}">
      <label for="motivo_cancelacion">Motivo de cancelación <span class="opt">(opcional, se muestra en la web)</span></label>
      <textarea id="motivo_cancelacion" name="motivo_cancelacion" maxlength="300" placeholder="Ej: Por enfermedad del elenco. Volvemos la próxima semana.">${esc(ev.motivo_cancelacion || '')}</textarea>
      <p class="cocina-field__hint">Si dejás este campo vacío, sólo se muestra "Función cancelada" sin más explicación.</p>
    </div>

    <div class="cocina-field">
      <label for="color">Color del día <span class="opt">(opcional, se elige automático según día de la semana)</span></label>
      <select id="color" name="color">
        <option value="">Automático</option>
        <option value="rojo"    ${ev.color === 'rojo' ? 'selected' : ''}>Rojo (viernes)</option>
        <option value="violeta" ${ev.color === 'violeta' ? 'selected' : ''}>Violeta (jueves)</option>
      </select>
    </div>

    <div class="cocina-field">
      <label>Flyer <span class="opt">(1080×1080 recomendado, máx 3MB)</span></label>
      ${flyerBlock}
      <input type="file" name="flyer" accept="image/jpeg,image/png,image/webp">
      <p class="cocina-field__hint">Si subís uno nuevo, reemplaza al actual.</p>
    </div>

    <div class="cocina-field">
      <label for="link_instagram">Link al post de Instagram <span class="opt">(opcional)</span></label>
      <input type="url" id="link_instagram" name="link_instagram" placeholder="https://www.instagram.com/p/..." value="${esc(ev.link_instagram || '')}">
    </div>

    <div class="cocina-field">
      <label for="notas_internas">Notas privadas <span class="opt">(no se muestran en el sitio)</span></label>
      <textarea id="notas_internas" name="notas_internas">${esc(ev.notas_internas || '')}</textarea>
    </div>

    <hr class="cocina-divider">

    <div class="cocina-form__actions">
      <a href="/cocina/panel" class="btn-cocina btn-cocina--ghost">Cancelar</a>
      ${borrarBtn}
      <button type="submit" class="btn-cocina btn-cocina--primary">${idOriginal ? 'Guardar cambios' : 'Crear evento'}</button>
    </div>
  </form>
</div>

<script>
const PLANTILLAS = ${JSON.stringify(plantillas || {})};

(function () {
  const estadoEl = document.getElementById('estado');
  const motivoWrap = document.getElementById('motivo-cancelacion-wrap');
  if (!estadoEl || !motivoWrap) return;
  estadoEl.addEventListener('change', function () {
    motivoWrap.style.display = this.value === 'cancelado' ? '' : 'none';
  });
})();

(function () {
  const select = document.getElementById('plantilla_select');
  if (!select) return;
  select.addEventListener('change', function () {
    const p = PLANTILLAS[this.value];
    if (!p) return;
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && (el.value === '' || el.dataset.fromPlantilla === '1')) {
        el.value = val; el.dataset.fromPlantilla = '1';
      }
    };
    set('nombre_show', p.nombre_show || '');
    set('descripcion', p.descripcion || '');
    set('hora', p.hora || '21:30');
    set('duracion_minutos', p.duracion_minutos || 90);
    const elencoEl = document.getElementById('elenco');
    if (elencoEl && (elencoEl.value === '' || elencoEl.dataset.fromPlantilla === '1')) {
      elencoEl.value = (p.elenco || []).join('\\n'); elencoEl.dataset.fromPlantilla = '1';
    }
    const colorEl = document.getElementById('color');
    if (colorEl && (colorEl.value === '' || colorEl.dataset.fromPlantilla === '1')) {
      colorEl.value = p.color || ''; colorEl.dataset.fromPlantilla = '1';
    }
    const estadoEl = document.getElementById('estado');
    if (estadoEl && p.estado_default && estadoEl.dataset.fromPlantilla !== 'manual') {
      estadoEl.value = p.estado_default; estadoEl.dataset.fromPlantilla = '1';
    }
    let flyerHidden = document.getElementById('flyer_default_hidden');
    if (p.flyer_default) {
      if (!flyerHidden) {
        flyerHidden = document.createElement('input');
        flyerHidden.type = 'hidden'; flyerHidden.name = 'flyer_default'; flyerHidden.id = 'flyer_default_hidden';
        document.getElementById('form-evento').appendChild(flyerHidden);
      }
      flyerHidden.value = p.flyer_default;
    } else if (flyerHidden) {
      flyerHidden.value = '';
    }
    const fechaEl = document.getElementById('fecha');
    if (fechaEl && !fechaEl.value && p.dia_semana) {
      const map = { 'domingo':0,'lunes':1,'martes':2,'miercoles':3,'miércoles':3,'jueves':4,'viernes':5,'sabado':6,'sábado':6 };
      const target = map[p.dia_semana];
      if (target != null) {
        const hoy = new Date();
        const diff = (target - hoy.getDay() + 7) % 7 || 7;
        const prox = new Date(hoy); prox.setDate(hoy.getDate() + diff);
        const yyyy = prox.getFullYear();
        const mm = String(prox.getMonth() + 1).padStart(2, '0');
        const dd = String(prox.getDate()).padStart(2, '0');
        fechaEl.value = yyyy + '-' + mm + '-' + dd;
      }
    }
  });
})();
</script>`;
  return layout(idOriginal ? 'Editar evento' : 'Nuevo evento', body, { loggedIn: true });
}

export function borrarPage({ ev, id, csrf }) {
  const body = `
<div class="cocina-wrap cocina-wrap--narrow">
  <h1 class="cocina-title">¿Borrar este evento?</h1>
  <div class="cocina-flash cocina-flash--info">Esta acción no se puede deshacer.</div>

  <div class="cocina-evento cocina-evento--${esc(ev.color || 'rojo')}" style="margin-bottom:1.25rem;">
    <div class="cocina-evento__body">
      <p class="cocina-evento__fecha">${esc(fechaHumana(ev.fecha, true))} · ${esc(ev.hora)}hs</p>
      <p class="cocina-evento__titulo">${esc(ev.nombre_show)}</p>
    </div>
  </div>

  <form method="post" action="/cocina/borrar">
    <input type="hidden" name="_csrf" value="${esc(csrf)}">
    <input type="hidden" name="id" value="${esc(id)}">
    <div class="cocina-form__actions">
      <a href="/cocina/editar?id=${esc(id)}" class="btn-cocina btn-cocina--ghost">Cancelar</a>
      <button type="submit" class="btn-cocina btn-cocina--danger">Sí, borrar</button>
    </div>
  </form>
</div>`;
  return layout('Borrar evento', body, { loggedIn: true });
}

export { ucfirst };
