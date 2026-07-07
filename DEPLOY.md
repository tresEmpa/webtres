# Puesta en producción — paso a paso

Guía para dejar el sitio andando en **GitHub + Cloudflare Pages**. No hace falta
saber programar; es cuestión de seguir los pasos y copiar/pegar.

Todo lo que se usa acá es **gratis** para un sitio de este tamaño.

---

## Resumen de lo que vamos a hacer

1. Subir esta carpeta a un repositorio de GitHub.
2. Generar la contraseña del panel de administración.
3. Crear un token de GitHub (para que el panel pueda guardar los shows).
4. Conectar Cloudflare Pages al repositorio.
5. Cargar las variables secretas en Cloudflare.
6. Apuntar el dominio `tresempanadas.com.ar` a Cloudflare.

---

## 1. Subir el proyecto a GitHub

1. Crear una cuenta en https://github.com (si no tenés).
2. Crear un repositorio nuevo, por ejemplo `tresempanadas`. Puede ser **privado**.
3. Subir el contenido de esta carpeta al repositorio. La forma más fácil sin
   consola es con **GitHub Desktop** (https://desktop.github.com): "Add local
   repository" → elegís esta carpeta → "Publish".
   - Si preferís la terminal:
     ```bash
     git init
     git add .
     git commit -m "Sitio Tres Empanadas v2 (sin PHP)"
     git branch -M main
     git remote add origin https://github.com/USUARIO/tresempanadas.git
     git push -u origin main
     ```

> El archivo `.gitignore` ya evita subir cosas que no van (la carpeta `dist`, etc.).

---

## 2. Generar la contraseña del panel

En la carpeta del proyecto, con Node instalado:

```bash
node tools/hash-password.mjs "LA-CONTRASEÑA-QUE-QUIERAS"
```

Te va a imprimir una línea que empieza con `pbkdf2$...`. **Guardala**, la vas a
pegar en Cloudflare en el paso 5 (variable `COCINA_PASS_HASH`).

> El usuario por defecto es `checho`. Se puede cambiar en el paso 5 (`COCINA_USER`).

---

## 3. Crear el token de GitHub

El panel guarda los shows haciendo cambios en el repositorio, así que necesita un
permiso (token) para escribir.

1. Entrá a https://github.com/settings/tokens?type=beta → **Generate new token**
   (fine-grained).
2. **Repository access** → "Only select repositories" → elegí `tresempanadas`.
3. **Permissions** → **Repository permissions** → **Contents** → **Read and write**.
4. Generá el token y **copialo** (empieza con `github_pat_...`). Solo se muestra una vez.

Lo vas a pegar en Cloudflare como `GITHUB_TOKEN` (paso 5).

---

## 4. Conectar Cloudflare Pages

1. Creá una cuenta en https://dash.cloudflare.com (gratis).
2. **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
3. Autorizá GitHub y elegí el repositorio `tresempanadas`.
4. Configuración del build:
   - **Framework preset:** None
   - **Build command:** `node build.mjs`
   - **Build output directory:** `dist`
5. **Save and Deploy**. El primer deploy va a tardar un minuto.

---

## 5. Cargar las variables (secretos) en Cloudflare

En el proyecto de Pages → **Settings** → **Variables and Secrets** → agregá estas.
Marcá como **Secret** (encriptado) las que dicen 🔒.

| Nombre              | Valor                                                                 |
|---------------------|-----------------------------------------------------------------------|
| `COCINA_USER`       | `checho` (o el usuario que quieras)                                   |
| `COCINA_PASS_HASH` 🔒| la línea `pbkdf2$...` del paso 2                                      |
| `SESSION_SECRET` 🔒 | un texto largo y al azar (ver abajo cómo generarlo)                   |
| `GITHUB_TOKEN` 🔒   | el token `github_pat_...` del paso 3                                  |
| `GITHUB_REPO`       | `USUARIO/tresempanadas` (tu usuario/repo)                             |
| `GITHUB_BRANCH`     | `main`                                                                 |
| `APPS_SCRIPT_URL` 🔒| la URL del Apps Script de la Sheet de reservas (la de siempre)        |

Para generar el `SESSION_SECRET`, cualquiera de estas sirve:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

o simplemente inventá una cadena larga de 40+ caracteres al azar.

> `APPS_SCRIPT_URL` ya viene con un valor por defecto en el código (la que usaba el
> sitio). Si no la cargás, igual funciona; cargarla te deja cambiarla sin tocar código.

Después de guardar las variables, andá a **Deployments** → **Retry deployment**
(o esperá al siguiente) para que tomen efecto.

---

## 6. Dominio

1. En Cloudflare, agregá el sitio `tresempanadas.com.ar` (Add a site) y seguí los
   pasos para apuntar los **nameservers** del dominio a Cloudflare (se hace una vez,
   donde compraste el dominio).
2. En el proyecto de Pages → **Custom domains** → agregá `tresempanadas.com.ar` y
   `www.tresempanadas.com.ar`.
3. Para que `www` redirija a la versión sin `www` (como antes), en Cloudflare →
   **Rules** → **Redirect Rules** → creá una: si el host es `www.tresempanadas.com.ar`,
   redirigir 301 a `https://tresempanadas.com.ar/$1`.
4. HTTPS es automático (Cloudflare emite el certificado). Los redirects de las URLs
   viejas de WordPress ya están incluidos (archivo `_redirects`).

---

## Cómo se usa el panel (igual que antes)

- Entrás a `https://tresempanadas.com.ar/cocina/` con tu usuario y contraseña.
- Cargás, editás o borrás shows y subís el flyer.
- Al guardar, el cambio se registra y **el sitio se actualiza solo en ~1 minuto**
  (se regenera automáticamente). Es la única diferencia con Hostinger, donde el
  cambio era instantáneo. Para un calendario de shows que se edita por semana, no
  se nota.

## Cambiar la contraseña más adelante

1. `node tools/hash-password.mjs "nueva-contraseña"`
2. En Cloudflare, editá la variable `COCINA_PASS_HASH` con el nuevo valor.
3. Listo (no hace falta re-deployar; las Functions leen la variable en cada visita).

## Backup

Todos los datos (shows, flyers) viven como archivos en el repositorio de GitHub,
con historial de cada cambio. Eso **es** el backup. Podés descargar todo el repo
cuando quieras (Code → Download ZIP).

## Si algo no anda

- **El panel dice "Falta configurar GITHUB_REPO y/o GITHUB_TOKEN"** → falta cargar
  esas variables en Cloudflare (paso 5) o retryar el deployment.
- **No entra al panel** → revisá `COCINA_USER` y regenerá `COCINA_PASS_HASH`.
- **Guardo un show y no aparece** → esperá ~1 minuto (el rebuild) y recargá. Podés
  ver el progreso en Cloudflare → Deployments.
