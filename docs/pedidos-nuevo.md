# Sistema de pedidos nuevo (carta + panel)

Rama `pedidos-nuevo`. Independiente del circuito viejo (Apps Script / WhatsApp / barra.html), que NO se toca.

## Qué hay
- `/carta-nueva/` carta del cliente (noindex mientras se prueba).
- `/panel/` panel de barra (clave = la de /cocina).
- `/api/*` funciones (menú, pedido, aviso de transferencia, panel).
- `migrations/` esquema D1 y productos iniciales.
- `functions/_pedidos/core.js` lógica: pedidos, stock, entregas, cuentas.
- `tests/core.test.mjs` (`npm test`) y `tests/api.e2e.sh` (contra `wrangler pages dev`).

## Pasos en Cloudflare (los hace Tres, uno por vez)
1. Crear base D1 `tres-pedidos` (una para pruebas/preview, otra para producción).
2. Aplicar `migrations/0001`, `0002`, `0003` en cada base (en orden).
3. Pages → proyecto → Settings → Bindings: agregar D1 con nombre de variable `DB` (Preview y Production, cada una con su base).
4. Variables ya existentes que se reutilizan: `COCINA_USER`, `COCINA_PASS_HASH`, `SESSION_SECRET`.
   No se declara D1 en `wrangler.toml` a propósito: eso podría pisar las variables del panel de Cloudflare.

## Cambio final (cuando esté probado)
`/carta-nueva/` pasa a `/carta/` (y se saca el noindex), se retira `barra.html` y se actualizan los QR si hiciera falta.
Hacerlo un día sin función y dejar el sistema viejo vivo varias funciones como respaldo.
