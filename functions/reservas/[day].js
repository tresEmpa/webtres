/**
 * /reservas/<algo>/   (Cloudflare Pages Function)
 *
 * OJO: jueves y viernes YA NO PASAN POR ACÁ.
 * Desde que el build genera /reservas/jueves/index.html y
 * /reservas/viernes/index.html, Cloudflare Pages sirve el archivo estático y
 * esta Function nunca corre para esos dos segmentos. Se hizo a propósito: el
 * redirect 302 dejaba a esas URLs sin página propia, así que no podían
 * posicionar y toda la autoridad iba a una URL con fecha que caduca en una
 * semana. Ver src/templates/dia.mjs.
 *
 * Lo que sigue haciendo: cualquier otro segmento (/reservas/sabado/, un id mal
 * escrito, un link viejo) cae acá y va al listado. Para jueves/viernes queda
 * como red de seguridad si alguna vez faltara el archivo estático.
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
