# Tres Empanadas Comedia — sitio web (v2, sin PHP)

Sitio del club de comedia **Tres Empanadas** (La Plata), reescrito para funcionar
en **GitHub + Cloudflare Pages**, sin PHP ni servidor propio.

El contenido y las funciones son las mismas que la versión anterior (Hostinger):
las páginas públicas, la carta, los cursos, las reservas por WhatsApp y el panel
de administración (`/cocina`) para cargar y editar shows.

## Cómo está armado

- **Páginas públicas** → HTML estático generado en el build (`build.mjs`) a partir
  de los datos en `data/`. Rápido, gratis y con el mismo SEO (metadatos, Schema.org,
  Open Graph, sitemap).
- **Panel de administración** (`/cocina`) → Cloudflare Pages Functions (JavaScript
  serverless). Login con contraseña, y crear / editar / borrar shows con subida de
  flyer. Cada cambio se guarda como archivo en el repositorio (vía GitHub API) y
  dispara automáticamente un rebuild que actualiza el sitio (~1 minuto).
- **Reservas** → una Function (`/reservas/registrar`) que reenvía la reserva al
  mismo Google Apps Script / Google Sheet de siempre. El visitante sigue confirmando
  por WhatsApp exactamente igual que antes.

```
data/                 ← los datos (fuente de verdad, también el backup en Git)
  eventos/*.json        cada show es un archivo JSON
  flyers/*              imágenes de los flyers
  lugar.json            dirección, contacto, redes
  plantillas.json       plantillas de shows para el panel
static/               ← se copia tal cual al sitio (CSS, imágenes, carta, favicons)
src/                  ← generador estático (plantillas + lógica de eventos)
functions/            ← Cloudflare Pages Functions (admin y reservas)
build.mjs             ← genera la carpeta /dist con el sitio final
tools/hash-password.mjs ← genera el hash de la contraseña del panel
```

## Probar en la compu (opcional)

Necesitás Node 18+ instalado.

```bash
npm run build      # genera /dist
```

Para previsualizar con las funciones hace falta Wrangler (la herramienta de
Cloudflare): `npm run preview`. Para ver el sitio estático solo, podés abrir la
carpeta `dist/` con cualquier servidor estático.

Para previsualizar shows futuros (que hoy figuran como pasados) podés fijar la fecha:

```bash
TEP_BUILD_NOW=2026-05-13 npm run build
```

## Puesta en producción

Ver **DEPLOY.md** — está todo el paso a paso para crear el repo, conectar
Cloudflare Pages y configurar la contraseña y los secretos.

## La clave / secretos

Nada sensible vive en el repositorio. La contraseña del panel se guarda **hasheada**
como variable secreta en Cloudflare, y el token de GitHub y el secreto de sesión
también. El viejo `cocina/config.php` de Hostinger **no** se usa ni se sube.
