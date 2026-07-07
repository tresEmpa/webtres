/**
 * POST /reservas/registrar  (Cloudflare Pages Function)
 *
 * Reemplaza reservas/registrar.php. Recibe el formulario de reserva y lo
 * reenvía al Google Apps Script que lo agrega como fila en la Sheet.
 * Devuelve { ok:true } o { ok:false, error } con 502 si la Sheet falló.
 *
 * La URL del Apps Script se toma de la variable de entorno APPS_SCRIPT_URL
 * (configurable en Cloudflare). Si no está, usa la que ya venía en el sitio.
 */

const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbx0Bhnxv-THgxFfHlFeoM2D1ZMPzDD5Fx4gU8ZWbb2Tl32OgmeTG44S2dGVtnZusiYP3g/exec';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost({ request, env }) {
  const url = env.APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

  let form;
  try {
    form = await request.formData();
  } catch {
    return new Response('Datos inválidos', { status: 400 });
  }

  const get = (k) => (form.get(k) ?? '').toString().trim();
  const eventoId = get('evento_id');
  const eventoFecha = get('evento_fecha');
  const eventoNombre = get('evento_nombre');
  let nombre = get('nombre');
  let personas = get('personas');
  let mensaje = get('mensaje');

  if (!nombre || !personas || !eventoId) {
    return new Response('Datos incompletos', { status: 400 });
  }

  const m = personas.match(/(\d+)/);
  if (!m) return new Response('Cantidad de personas inválida', { status: 400 });
  const cantidad = parseInt(m[1], 10);
  if (cantidad < 1 || cantidad > 6) {
    return new Response(
      'La reserva web es para grupos de hasta 6 personas. Para grupos más grandes hay que coordinar por WhatsApp.',
      { status: 400 },
    );
  }

  // Limitar largos
  nombre = nombre.slice(0, 100);
  personas = personas.slice(0, 30);
  mensaje = mensaje.slice(0, 500);

  const payload = {
    timestamp: new Date().toISOString(),
    fecha_evento: eventoFecha,
    evento: eventoNombre,
    evento_id: eventoId,
    nombre,
    personas,
    mensaje,
    ip: request.headers.get('cf-connecting-ip') || '',
    ua: (request.headers.get('user-agent') || '').slice(0, 200),
  };

  if (!url) return json({ ok: false, error: 'sin URL del Apps Script' }, 502);

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!res.ok) return json({ ok: false, error: 'HTTP ' + res.status }, 502);

    let body = null;
    try { body = await res.json(); } catch { body = null; }
    if (body && body.ok) return json({ ok: true });
    return json({ ok: false, error: 'respuesta inesperada' }, 502);
  } catch (e) {
    return json({ ok: false, error: 'excepción: ' + (e && e.message ? e.message : String(e)) }, 502);
  }
}

// Cualquier otro método
export async function onRequestGet() {
  return new Response('Method Not Allowed', { status: 405 });
}
