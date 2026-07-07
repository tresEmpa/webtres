/**
 * /reservas/jueves/  y  /reservas/viernes/   (Cloudflare Pages Function)
 *
 * Reemplaza reservas/jueves/index.php y reservas/viernes/index.php.
 * Atajo SEO: redirige (302) al próximo evento cargado de ese día de la semana.
 * Si no hay, va al listado general /reservas/.
 *
 * Lee la agenda generada en el build (/data/agenda.json) vía ASSETS, así que
 * recalcula "el próximo" en cada visita según la fecha real.
 *
 * Las páginas de eventos (/reservas/YYYY-MM-DD-slug/) son estáticas y las sirve
 * Pages directamente; esta función sólo corre para segmentos sin archivo.
 */

import { proximoPorDia } from '../_lib/eventos.js';

export async function onRequest(context) {
  const { params, env, request } = context;
  const day = (params.day || '').toLowerCase();

  // Sólo jueves/viernes tienen atajo; cualquier otra cosa → listado.
  if (day !== 'jueves' && day !== 'viernes') {
    return Response.redirect(new URL('/reservas/', request.url).toString(), 302);
  }

  let agenda = [];
  try {
    const res = await env.ASSETS.fetch(new URL('/data/agenda.json', request.url));
    if (res.ok) agenda = await res.json();
  } catch { /* seguimos con agenda vacía */ }

  const prox = proximoPorDia(agenda, day);
  const dest = prox ? `/reservas/${prox.id}/` : '/reservas/';
  return Response.redirect(new URL(dest, request.url).toString(), 302);
}
