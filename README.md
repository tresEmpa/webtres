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

- **El sitio cambia solo según la hora** → los días de función, a las **20:00 de
  Argentina** se apaga el formulario de reserva y aparece un botón de WhatsApp
  ("¿Estás sobre la hora?"); a las **22:00** pasa a "Por hoy ya cerramos". Se
  calcula en el navegador de cada visitante, en hora de Argentina, sin importar
  dónde tenga el reloj. Ver más abajo.

```
data/                 ← los datos (fuente de verdad, también el backup en Git)
  eventos/*.json        cada show es un archivo JSON
  flyers/*              imágenes de los flyers
  lugar.json            dirección, contacto, redes
  plantillas.json       plantillas de shows para el panel
static/               ← se copia tal cual al sitio (CSS, imágenes, carta, favicons)
src/                  ← generador estático (plantillas + lógica de eventos)
  lib/cliente.mjs       estado por horario + medición (lo que corre en el navegador)
functions/            ← Cloudflare Pages Functions (admin y reservas)
build.mjs             ← genera la carpeta /dist con el sitio final
tools/hash-password.mjs ← genera el hash de la contraseña del panel
tools/verificar-*.mjs   ← pruebas de los estados y de los eventos de medición
```

## Estados por horario

Los días de función el sitio pasa por cuatro estados:

| Estado | Cuándo | Qué se ve |
|---|---|---|
| `NORMAL` | Todo lo demás | El formulario de reserva |
| `ULTIMA_HORA` | Día de función, 20:00 a 22:00 | "¿Estás sobre la hora?" + botón de WhatsApp. Sin formulario |
| `CERRADO` | Día de función, 22:00 a 23:59 | "Por hoy ya cerramos" + link a la cartelera |
| `SIN_FUNCION` | Días sin show | La cartelera normal |

Tres cosas que conviene no romper:

1. **Las horas se cambian en un solo lugar**: `HORA_ULTIMA_HORA` y `HORA_CIERRE`,
   arriba de `src/lib/cliente.mjs`.
2. **Siempre hora de Argentina**, con `Intl.DateTimeFormat` + `formatToParts`.
   Nunca `getHours()` ni `getDay()`, que devuelven la hora del dispositivo del
   visitante: alguien con el celular mal configurado, o mirando desde España,
   tiene que ver lo mismo que se ve en La Plata.
3. **Siempre en el navegador, en cada carga.** No se puede resolver en el build:
   Cloudflare cachea el HTML y a las tres horas estaría sirviendo un estado viejo.
   Lo que sí viene del build es la lista de fechas con función; el listado además
   la refresca contra `/data/agenda.json`, que es la misma agenda que genera
   `/reservas/`, por si el HTML quedó cacheado y se cargó una función nueva.

La página de una función sólo reacciona a **su propia fecha**: el jueves a las
21:10 se apaga la página del jueves, y la del viernes que viene sigue tomando
reservas, que nadie necesita mirar esa noche.

El formulario no llega a verse ni un instante cuando no corresponde: el bloque
`<style>` del `<head>` deja visible sólo lo marcado `NORMAL`, y el script que
resuelve el estado corre antes de que el navegador pinte la página. Si el
visitante tiene el JavaScript apagado ve el formulario de siempre.

## Medición

Todos los caminos de reserva disparan el **mismo evento estándar `Lead`**,
diferenciados por `content_category`. No se inventan eventos personalizados por
camino: Meta optimiza sobre eventos estándar y partirlos fragmenta la señal.

| Momento | Meta | GA4 | `content_category` |
|---|---|---|---|
| Carga la página de una función | `ViewContent` | `view_item` | `funcion` |
| Primer foco en el formulario (una vez por sesión) | `InitiateCheckout` | `begin_checkout` | — |
| Envía el formulario | `Lead` | `generate_lead` | `reserva_web` |
| Consulta por WhatsApp sobre la hora | `Lead` | `generate_lead` | `reserva_ultima_hora` |
| Toca el botón flotante de WhatsApp | `Contact` | `contact` | `wsp_flotante` |

Todo pasa por `TEP.track()`, en `src/lib/cliente.mjs`. Cada disparo lleva un
`eventID` único: hoy no se usa, pero el día que se sume la API de Conversiones
desde el servidor sirve para que Meta no cuente dos veces. Ningún evento lleva
nombre, teléfono ni datos personales de quien reserva: sólo el nombre del show y
la cantidad de personas.

⚠ **Falta el ID de Google Analytics.** El sitio carga gtag sólo para Google Ads
(`AW-11304999909`), que no es lo mismo que Analytics. Hasta que se complete
`GA4_ID` en `src/lib/cliente.mjs` con el código `G-…`, los eventos GA4 se
disparan pero ninguna propiedad de Analytics los recibe. Meta mide igual.

## Probar los estados y los eventos

Las dos herramientas de `tools/` abren un navegador de verdad con el reloj y la
zona horaria forzados. Playwright no está en `package.json` a propósito, para no
hacerle perder tiempo al build de Cloudflare:

```bash
npm i --no-save playwright
TEP_BUILD_NOW=2026-08-19 node build.mjs
node tools/verificar-estados.mjs   # 16 casos: horarios, zonas horarias, parpadeo
node tools/verificar-eventos.mjs   # los cinco eventos, una sola vez y con sus parámetros
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
