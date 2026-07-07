/**
 * /cocina/*  — Panel de administración (Cloudflare Pages Function).
 *
 * Reemplaza todo /cocina/*.php. Login con contraseña (PBKDF2) + sesión firmada,
 * y CRUD de shows que persiste como archivos JSON en el repo vía GitHub API.
 * Cada guardado dispara el rebuild de Pages y regenera las páginas del sitio.
 *
 * Rutas:
 *   GET  /cocina, /cocina/login      → login
 *   POST /cocina/login               → autenticar
 *   GET  /cocina/logout              → salir
 *   GET  /cocina/panel               → listado de shows
 *   GET  /cocina/editar[?id=]        → formulario crear/editar
 *   POST /cocina/editar[?id=]        → guardar
 *   GET  /cocina/borrar?id=          → confirmación
 *   POST /cocina/borrar              → borrar
 */

import {
  verifyPassword, timingSafeEqual, createSessionToken, sessionCookie,
  getSession, newCsrfToken, csrfCookie, parseCookies, COOKIE_NAMES,
} from '../_lib/auth.js';
import {
  loadEventosFromRepo, getFile, putTextFile, putBase64File, deleteFile, listDir,
} from '../_lib/github.js';
import {
  diaSemana, eventoId, listarEventos, hoyISO,
} from '../_lib/eventos.js';
import {
  loginPage, panelPage, editarPage, borrarPage, esc,
} from '../_lib/cocina-ui.js';

const EXT_BY_MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function redirect(url, headers = []) {
  const h = new Headers({ Location: url });
  for (const [k, v] of headers) h.append(k, v);
  return new Response(null, { status: 302, headers: h });
}

function htmlResponse(html, extraHeaders = []) {
  const h = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
  for (const [k, v] of extraHeaders) h.append(k, v);
  return new Response(html, { status: 200, headers: h });
}

function normalizePath(pathname) {
  // /cocina, /cocina/, /cocina/panel, /cocina/panel/ → sin barra final
  let p = pathname.replace(/\/+$/, '');
  if (p === '' || p === '/cocina') p = '/cocina';
  return p;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  const method = request.method;

  try {
    // --- LOGIN ---
    if (path === '/cocina' || path === '/cocina/login') {
      if (method === 'POST') return handleLoginPost(request, env);
      return handleLoginGet(request, env, url);
    }
    if (path === '/cocina/logout') {
      return redirect('/cocina/login', [['Set-Cookie', sessionCookie('', { clear: true })]]);
    }

    // --- Rutas protegidas ---
    const session = await getSession(request, env);
    if (!session) {
      if (method === 'POST') return new Response('Sesión expirada. Volvé a entrar.', { status: 401 });
      return redirect(`/cocina/login?next=${encodeURIComponent(url.pathname + url.search)}`);
    }

    if (path === '/cocina/panel') return handlePanel(request, env, url);
    if (path === '/cocina/editar') {
      return method === 'POST' ? handleEditarPost(request, env, url) : handleEditarGet(request, env, url);
    }
    if (path === '/cocina/borrar') {
      return method === 'POST' ? handleBorrarPost(request, env) : handleBorrarGet(request, env, url);
    }

    return redirect('/cocina/panel');
  } catch (err) {
    return new Response(`Error del servidor: ${esc(err.message || String(err))}`, {
      status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// ============ LOGIN ============

function sanitizeNext(next) {
  if (typeof next !== 'string') return '/cocina/panel';
  if (!/^\/cocina\/[a-z0-9._\-/?=&%]*$/i.test(next)) return '/cocina/panel';
  return next;
}

async function handleLoginGet(request, env, url) {
  const session = await getSession(request, env);
  const next = sanitizeNext(url.searchParams.get('next') || '/cocina/panel');
  if (session) return redirect(next);
  const csrf = newCsrfToken();
  return htmlResponse(loginPage({ error: null, csrf, next }), [['Set-Cookie', csrfCookie(csrf)]]);
}

async function handleLoginPost(request, env) {
  const form = await request.formData();
  const cookies = parseCookies(request);
  const csrfCookieVal = cookies[COOKIE_NAMES.CSRF_COOKIE] || '';
  const csrfForm = (form.get('_csrf') || '').toString();
  const next = sanitizeNext((form.get('next') || '/cocina/panel').toString());

  const renderError = (msg) => {
    const csrf = newCsrfToken();
    return htmlResponse(loginPage({ error: msg, csrf, next }), [['Set-Cookie', csrfCookie(csrf)]]);
  };

  if (!csrfCookieVal || !timingSafeEqual(csrfCookieVal, csrfForm)) {
    return renderError('Token expirado, recargá y volvé a intentar.');
  }

  const user = (form.get('user') || '').toString();
  const pass = (form.get('pass') || '').toString();

  const userOk = timingSafeEqual(user, env.COCINA_USER || '');
  const passOk = await verifyPassword(pass, env.COCINA_PASS_HASH || '');

  if (!userOk || !passOk) return renderError('Usuario o contraseña incorrectos.');

  const token = await createSessionToken(env.SESSION_SECRET || '', user);
  return redirect(next, [['Set-Cookie', sessionCookie(token)]]);
}

// ============ PANEL ============

async function handlePanel(request, env, url) {
  const eventos = await loadEventosFromRepo(env);
  const proximos = listarEventos(eventos, { orden: 'asc', incluirPasados: false });
  const ayer = hoyISOminus1();
  const pasados = listarEventos(eventos, { orden: 'desc', incluirPasados: true, hasta: ayer }).slice(0, 10);

  const flash = url.searchParams.get('msg') || '';
  let flashType = url.searchParams.get('type') || 'ok';
  if (!['ok', 'err', 'info'].includes(flashType)) flashType = 'ok';

  return htmlResponse(panelPage({ proximos, pasados, flash, flashType }));
}

function hoyISOminus1() {
  const d = new Date(Date.now() - 24 * 3600 * 1000);
  const ar = new Date(d.getTime() - 3 * 3600 * 1000);
  return ar.toISOString().slice(0, 10);
}

// ============ EDITAR ============

async function loadPlantillas(env) {
  try {
    const f = await getFile(env, 'data/plantillas.json');
    return f ? JSON.parse(f.text) : {};
  } catch { return {}; }
}

async function handleEditarGet(request, env, url) {
  const idOriginal = url.searchParams.get('id') || null;
  const plantillas = await loadPlantillas(env);
  const csrf = newCsrfToken();

  let ev;
  if (idOriginal) {
    const file = await getFile(env, `data/eventos/${sanitizeId(idOriginal)}.json`);
    if (!file) {
      return redirect('/cocina/panel?msg=' + encodeURIComponent('El evento no existe') + '&type=err');
    }
    ev = JSON.parse(file.text);
    ev.id = sanitizeId(idOriginal);
  } else {
    ev = defaultEvento();
  }

  return htmlResponse(
    editarPage({ ev, plantillas, idOriginal, csrf, errores: [] }),
    [['Set-Cookie', csrfCookie(csrf)]],
  );
}

function defaultEvento() {
  return {
    fecha: '', nombre_show: '', descripcion: '', elenco: [], hora: '21:30',
    duracion_minutos: 90, estado: 'activo', motivo_cancelacion: '', plantilla: '',
    flyer: '', link_instagram: '', notas_internas: '', color: '',
  };
}

function sanitizeId(id) {
  return String(id || '').replace(/[^a-z0-9\-]/gi, '');
}

async function handleEditarPost(request, env, url) {
  const form = await request.formData();
  const cookies = parseCookies(request);

  // CSRF
  const csrfCookieVal = cookies[COOKIE_NAMES.CSRF_COOKIE] || '';
  const csrfForm = (form.get('_csrf') || '').toString();
  if (!csrfCookieVal || !timingSafeEqual(csrfCookieVal, csrfForm)) {
    return new Response('Token inválido. Recargá la página y volvé a intentar.', { status: 403 });
  }

  const idOriginal = url.searchParams.get('id') || null;
  const plantillas = await loadPlantillas(env);

  // Cargar evento original si es edición (para preservar flyer/creado)
  let evOriginal = null;
  if (idOriginal) {
    const file = await getFile(env, `data/eventos/${sanitizeId(idOriginal)}.json`);
    if (!file) return redirect('/cocina/panel?msg=' + encodeURIComponent('El evento no existe') + '&type=err');
    evOriginal = JSON.parse(file.text);
    evOriginal._sha = file.sha;
  }

  const t = (k, d = '') => (form.get(k) ?? d).toString().trim();
  const data = {
    fecha: t('fecha'),
    nombre_show: t('nombre_show'),
    descripcion: t('descripcion'),
    hora: t('hora', '21:30'),
    duracion_minutos: parseInt(t('duracion_minutos', '90'), 10) || 90,
    estado: t('estado', 'activo'),
    motivo_cancelacion: t('motivo_cancelacion'),
    plantilla: t('plantilla'),
    link_instagram: t('link_instagram'),
    notas_internas: t('notas_internas'),
    color: t('color'),
    flyer: (evOriginal && evOriginal.flyer) || '',
  };
  data.elenco = t('elenco').split(/\r\n|\r|\n/).map((s) => s.trim()).filter(Boolean);

  // Validaciones
  const errores = [];
  if (!data.fecha) errores.push('Falta la fecha.');
  if (!data.nombre_show) errores.push('Falta el nombre del show.');
  if (!/^\d{2}:\d{2}$/.test(data.hora)) errores.push('Hora con formato incorrecto (usá HH:MM).');
  if (!['activo', 'programado', 'agotado', 'cancelado'].includes(data.estado)) errores.push('Estado inválido.');
  if (data.duracion_minutos < 10 || data.duracion_minutos > 600) errores.push('Duración fuera de rango.');
  if (data.link_instagram && !/^https?:\/\//i.test(data.link_instagram)) errores.push('El link de Instagram debe empezar con http o https.');

  // Flyer nuevo
  const nuevoIdProvisional = (data.fecha && data.nombre_show) ? eventoId(data.fecha, data.nombre_show) : null;
  const flyerFile = form.get('flyer');
  let flyerToUpload = null; // { path, base64, oldToDelete }
  if (!errores.length && flyerFile && typeof flyerFile === 'object' && flyerFile.size > 0) {
    const buf = new Uint8Array(await flyerFile.arrayBuffer());
    const mime = detectMime(buf, flyerFile.type);
    if (!EXT_BY_MIME[mime]) {
      errores.push('El flyer tiene que ser JPG, PNG o WebP.');
    } else if (buf.length > 3 * 1024 * 1024) {
      errores.push('El flyer es muy pesado (máximo 3MB). Probá comprimirlo.');
    } else {
      const nombreFlyer = `${nuevoIdProvisional}.${EXT_BY_MIME[mime]}`;
      flyerToUpload = {
        path: `data/flyers/${nombreFlyer}`,
        base64: bytesToBase64(buf),
        nombreFlyer,
        oldFlyer: (evOriginal && evOriginal.flyer && evOriginal.flyer !== nombreFlyer) ? evOriginal.flyer : null,
      };
      data.flyer = nombreFlyer;
    }
  }

  // Quitar flyer
  let flyerToRemove = null;
  if (form.get('quitar_flyer') && evOriginal && evOriginal.flyer) {
    flyerToRemove = evOriginal.flyer;
    data.flyer = '';
  }

  // Flyer default de plantilla
  if (!data.flyer && form.get('flyer_default')) {
    const fd = String(form.get('flyer_default')).replace(/[^a-z0-9.\-_]/gi, '');
    // Verificamos que exista en el repo
    const exists = await getFile(env, `data/flyers/${fd}`).catch(() => null);
    if (exists) data.flyer = fd;
  }

  if (errores.length) {
    const ev = { ...(evOriginal || defaultEvento()), ...data };
    const csrf = newCsrfToken();
    return htmlResponse(
      editarPage({ ev, plantillas, idOriginal, csrf, errores }),
      [['Set-Cookie', csrfCookie(csrf)]],
    );
  }

  // Completar campos derivados (como tep_evento_guardar)
  data.dia_semana = diaSemana(data.fecha);
  if (!data.color) data.color = data.dia_semana === 'viernes' ? 'rojo' : 'violeta';
  const ahora = new Date().toISOString();
  data.actualizado = ahora;
  data.creado = (evOriginal && evOriginal.creado) ? evOriginal.creado : ahora;
  const idNuevo = eventoId(data.fecha, data.nombre_show);
  data.id = idNuevo;

  // --- Commits a GitHub ---
  // 1) Subir flyer nuevo si hay
  if (flyerToUpload) {
    const existing = await getFile(env, flyerToUpload.path).catch(() => null);
    await putBase64File(env, flyerToUpload.path, flyerToUpload.base64,
      `cocina: flyer ${flyerToUpload.nombreFlyer}`, existing ? existing.sha : undefined);
    if (flyerToUpload.oldFlyer) {
      const old = await getFile(env, `data/flyers/${flyerToUpload.oldFlyer}`).catch(() => null);
      if (old) await deleteFile(env, `data/flyers/${flyerToUpload.oldFlyer}`, 'cocina: baja flyer viejo', old.sha).catch(() => {});
    }
  }
  // 2) Quitar flyer si se pidió
  if (flyerToRemove) {
    const old = await getFile(env, `data/flyers/${flyerToRemove}`).catch(() => null);
    if (old) await deleteFile(env, `data/flyers/${flyerToRemove}`, 'cocina: quita flyer', old.sha).catch(() => {});
  }

  // 3) Guardar el JSON del evento
  const jsonStr = JSON.stringify(data, null, 4);
  const nuevoPath = `data/eventos/${idNuevo}.json`;
  let shaDestino;
  if (idOriginal && sanitizeId(idOriginal) === idNuevo) {
    shaDestino = evOriginal._sha;
  } else {
    const existingDest = await getFile(env, nuevoPath).catch(() => null);
    shaDestino = existingDest ? existingDest.sha : undefined;
  }
  await putTextFile(env, nuevoPath, jsonStr,
    idOriginal ? `cocina: edita ${idNuevo}` : `cocina: crea ${idNuevo}`, shaDestino);

  // 4) Si cambió el id en una edición, borrar el archivo viejo
  if (idOriginal && sanitizeId(idOriginal) !== idNuevo) {
    const viejoPath = `data/eventos/${sanitizeId(idOriginal)}.json`;
    const viejo = await getFile(env, viejoPath).catch(() => null);
    if (viejo) await deleteFile(env, viejoPath, `cocina: renombra ${idNuevo}`, viejo.sha).catch(() => {});
  }

  const msg = idOriginal ? 'Cambios guardados. El sitio se actualiza en ~1 minuto.' : 'Evento creado. El sitio se actualiza en ~1 minuto.';
  return redirect('/cocina/panel?msg=' + encodeURIComponent(msg) + '&type=ok');
}

// ============ BORRAR ============

async function handleBorrarGet(request, env, url) {
  const id = sanitizeId(url.searchParams.get('id') || '');
  const file = id ? await getFile(env, `data/eventos/${id}.json`).catch(() => null) : null;
  if (!file) return redirect('/cocina/panel?msg=' + encodeURIComponent('El evento no existe') + '&type=err');
  const ev = JSON.parse(file.text);
  ev.id = id;
  const csrf = newCsrfToken();
  return htmlResponse(borrarPage({ ev, id, csrf }), [['Set-Cookie', csrfCookie(csrf)]]);
}

async function handleBorrarPost(request, env) {
  const form = await request.formData();
  const cookies = parseCookies(request);
  const csrfCookieVal = cookies[COOKIE_NAMES.CSRF_COOKIE] || '';
  const csrfForm = (form.get('_csrf') || '').toString();
  if (!csrfCookieVal || !timingSafeEqual(csrfCookieVal, csrfForm)) {
    return new Response('Token inválido. Recargá la página y volvé a intentar.', { status: 403 });
  }
  const id = sanitizeId((form.get('id') || '').toString());
  const file = id ? await getFile(env, `data/eventos/${id}.json`).catch(() => null) : null;
  if (!file) return redirect('/cocina/panel?msg=' + encodeURIComponent('El evento no existe') + '&type=err');

  const ev = JSON.parse(file.text);
  // Borrar flyer asociado
  if (ev.flyer) {
    const fl = await getFile(env, `data/flyers/${ev.flyer}`).catch(() => null);
    if (fl) await deleteFile(env, `data/flyers/${ev.flyer}`, 'cocina: borra flyer', fl.sha).catch(() => {});
  }
  await deleteFile(env, `data/eventos/${id}.json`, `cocina: borra ${id}`, file.sha);
  return redirect('/cocina/panel?msg=' + encodeURIComponent('Evento borrado. El sitio se actualiza en ~1 minuto.') + '&type=ok');
}

// ============ helpers binarios ============

function bytesToBase64(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function detectMime(bytes, fallback) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
  return fallback || '';
}
