// Interruptor de la carta: si en la tabla config de la base de pedidos CARTA_NUEVA = '1',
// /carta/ (donde apuntan todos los QR) manda a /carta-nueva/ conservando ?m=N (número de mesa).
// Se prende/apaga desde el panel (pestaña Carta). Sin base o con error: sirve la carta vieja.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const esPortada = url.pathname === '/carta' || url.pathname === '/carta/' || url.pathname === '/carta/index.html';
  if (esPortada && env.DB) {
    try {
      const r = await env.DB.prepare("SELECT valor FROM config WHERE clave = 'CARTA_NUEVA'").first();
      if (r && r.valor === '1') {
        return new Response(null, { status: 302, headers: { Location: '/carta-nueva/' + url.search, 'Cache-Control': 'no-store' } });
      }
    } catch (e) { /* ante cualquier problema, carta vieja */ }
  }
  const res = await next();
  if (!esPortada) return res;
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'no-store'); // que ningún celu se quede con la vieja guardada
  return out;
}
