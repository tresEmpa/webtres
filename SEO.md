# SEO — Tres Empanadas y sus sitios hermanos

Notas de la revisión de SEO, pensando los tres sitios como un **clúster de marca**
(todo de Checho Falco, stand up en La Plata desde 2013) y no como sitios sueltos que
compiten entre sí.

## Los tres sitios y qué "dueño" es cada uno

Para que Google no los haga pelear por las mismas búsquedas (canibalización), cada
sitio tiene que ser dueño de una **intención distinta**:

| Sitio | Rol | Intención / búsquedas que debe ganar |
|---|---|---|
| **nochesdestandup.com.ar** | La productora / la marca / la historia | "Sociedad Platense de Stand Up", "stand up La Plata productora", marca, quiénes son |
| **tresempanadas.com.ar** | El local, la cartelera y las reservas | "reservar", "funciones jueves/viernes", "dónde ver stand up La Plata", "microteatro", "carta / cerveza / empanadas", "cómo llegar" |
| **aprendestandup.com.ar** | La teoría / el curso online gratis | "aprender stand up", "curso stand up", "cómo hacer un chiste", "cómo empezar en stand up" |

La regla simple: **tresempanadas es transaccional/local** (te trae gente a reservar y
venir), **aprendestandup es educativo** (te trae gente a aprender), y **nochesdestandup
es la marca** que le da autoridad a los dos.

## Qué cambié en este sitio (tresempanadas)

1. **Se conectó el clúster en los datos estructurados (Schema).** El negocio ahora declara:
   - `parentOrganization` → **Noches de Stand Up** (la productora).
   - `sameAs` → suma `nochesdestandup.com.ar` y `aprendestandup.com.ar` (además de las redes).
   Esto le dice a Google que los tres dominios son **la misma organización**, así se
   refuerzan entre sí en vez de competir.

2. **Se evitó la canibalización con aprendestandup en la página de cursos.** Antes
   `/cursos/` competía por "Curso de Stand Up en La Plata" (que le corresponde a
   aprendestandup). Ahora esta página se posiciona como **"Taller y práctica de stand up
   los jueves"** (presencial, en el club) y **manda la teoría/curso online a
   aprendestandup.com.ar** con enlaces claros. Son complementarias, no rivales:
   - `aprendestandup` = teoría / curso online.
   - `tresempanadas/cursos` = práctica presencial los jueves.

3. **Enlace contextual de marca.** En la home, "Sociedad Platense de Stand Up" ahora
   enlaza a **nochesdestandup.com.ar** (con texto descriptivo), que es el hub de esa marca.

4. **robots.txt** — se limpiaron reglas viejas del admin PHP (ya no existen) y se bloqueó
   `/cocina/`. El `sitemap.xml` sigue declarado y se regenera solo con cada build,
   incluyendo las funciones próximas.

5. Lo que ya estaba bien y se mantiene: cada página con su `canonical` propio, Open Graph
   e imágenes, Schema `Event` en cada función (con estado/fecha/precio), `LocalBusiness`,
   `FAQ` en la home, `Course` en cursos, breadcrumbs, y el footer enlazando a los dos
   sitios hermanos.

## Recomendaciones para los otros dos sitios (los edita quien maneje esos dominios)

Estos cambios no los puedo aplicar desde acá, pero cierran el círculo del clúster:

- **Enlaces recíprocos con texto descriptivo.** Que `nochesdestandup` y `aprendestandup`
  enlacen a `tresempanadas.com.ar/reservas/` para "reservar / ver funciones", y a
  `/carta/` cuando hablen del local. Ya se mencionan entre sí; conviene que sean enlaces
  reales y con anchor claro ("reservá tu función en Tres Empanadas").
- **Mismo Schema de organización** en los tres, con los mismos `sameAs` (los tres dominios
  + redes) y NAP idéntico (Tres Empanadas, Calle 43 N° 1349 esq. 22, La Plata). Consistencia
  = Google entiende que es una sola entidad.
- **Que cada uno respete su intención**: aprendestandup no debería intentar rankear por
  "reservar función" ni tresempanadas por "cómo escribir chistes". Cada uno lo suyo y se
  enlazan.
- **Un solo Google Business Profile** (el del local) enlazando a tresempanadas como sitio
  oficial; los otros dos como enlaces de marca.

## Chequeos rápidos post-deploy (cuando esté en Cloudflare)

- Subir el sitio a **Google Search Console** (la verificación `google3a11b5bcbe0cc921.html`
  ya está incluida) y mandar el `sitemap.xml`.
- Validar un par de páginas en el **Rich Results Test** de Google (Event, LocalBusiness, FAQ).
- Confirmar que `www` redirige a sin-`www` y que todo va por HTTPS (ver DEPLOY.md).
