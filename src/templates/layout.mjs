/**
 * Layout compartido — port de includes/header.php + includes/footer.php.
 * Devuelve el HTML completo de una página pública.
 */

import {
  ESTADO_CSS, estadoScript, TRACKING_JS, WSP_FLOTANTE_JS, GA4_ID,
} from '../lib/cliente.mjs';

const SITE_NAME = 'Tres Empanadas Comedia';
const BASE_URL = 'https://tresempanadas.com.ar';
const DEFAULT_TITLE = 'Tres Empanadas Comedia | Microteatro de Stand Up en La Plata';
const DEFAULT_DESC = 'Microteatro de stand up en La Plata. Funciones jueves y viernes 21:30hs. Reservá gratis.';
const DEFAULT_IMAGE = `${BASE_URL}/assets/img/og-default.jpg`;

/**
 * Reputación en Google Maps — único lugar donde se actualiza.
 * `nota` va con coma (se muestra); `notaSchema` con punto (JSON-LD).
 * Al actualizar `opiniones`, revisar también el badge de /reservas/.
 */
export const GOOGLE = {
  nota: '4,9',
  notaSchema: '4.9',
  opiniones: 140,
  url: 'https://share.google/dyTTJVXR25JTlU7kX',
};

/** Estrella maciza, dorada. `px` = alto/ancho en píxeles. */
export function estrellaSVG(px) {
  return `<svg width="${px}" height="${px}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.9 6.26 6.85.72-5.1 4.6 1.44 6.72L12 16.9 5.91 20.3l1.44-6.72-5.1-4.6 6.85-.72z"/></svg>`;
}

/** htmlspecialchars equivalente. */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const ORG_SCHEMA = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://tresempanadas.com.ar/#business",
    "name": "Tres Empanadas Comedia",
    "alternateName": "Casa de Comedia",
    "url": "https://tresempanadas.com.ar",
    "logo": "https://tresempanadas.com.ar/assets/img/logo.png",
    "image": "https://tresempanadas.com.ar/assets/img/og-default.jpg",
    "telephone": "+5492215247488",
    "email": "info@tresempanadas.com.ar",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle 43 N° 1349",
      "addressLocality": "La Plata",
      "addressRegion": "Buenos Aires",
      "postalCode": "B1902AFA",
      "addressCountry": "AR"
    },
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Thursday", "Friday"],
      "opens": "21:00",
      "closes": "23:45"
    }],
    "priceRange": "$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "${GOOGLE.notaSchema}",
      "reviewCount": "${GOOGLE.opiniones}"
    },
    "founder": {
      "@type": "Person",
      "name": "Checho Falco",
      "description": "Abogado de profesión, comediante por elección. Desde 2013 arriba de los escenarios. Productor de la Sociedad Platense de Stand Up.",
      "sameAs": "https://nochesdestandup.com.ar"
    },
    "parentOrganization": {
      "@type": "Organization",
      "name": "Noches de Stand Up",
      "description": "Productora de stand up en La Plata desde 2013. Organiza la Sociedad Platense de Stand Up.",
      "url": "https://nochesdestandup.com.ar"
    },
    "sameAs": [
      "https://www.instagram.com/tresempanadascomedia",
      "https://www.facebook.com/TresEmpanadasComedia",
      "https://twitter.com/StandUpDeNoche",
      "https://nochesdestandup.com.ar",
      "https://aprendestandup.com.ar"
    ]
  }
  </script>`;

const TRACKING = `
  <!-- Google Ads (gtag.js) — AW-11304999909 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-11304999909"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-11304999909');${GA4_ID ? `
    gtag('config', '${GA4_ID}');` : `
    // Google Analytics 4: falta el ID "G-…". Cargalo en GA4_ID, arriba de
    // src/lib/cliente.mjs, y los eventos empiezan a llegar a Analytics.`}
  </script>

  <!-- Meta Pixel — 546014447181846 -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '546014447181846');
  fbq('track', 'PageView');
  </script>
  <noscript>
    <img height="1" width="1" style="display:none"
         src="https://www.facebook.com/tr?id=546014447181846&ev=PageView&noscript=1"
         alt="">
  </noscript>`;

function navLink(href, path, currentPath, label) {
  const active = currentPath.startsWith(path) ? ' class="active"' : '';
  return `<a href="${href}"${active}>${label}</a>`;
}

function renderNav(currentPath, opts = {}) {
  if (opts.adsSafe) {
    return `
        <a href="/">Inicio</a>
        <a href="#donde">Dónde</a>
        <a href="https://wa.me/5492215247488?text=Hola%2C%20quiero%20reservar%20lugar%20para%20stand%20up" class="site-nav__cta" target="_blank" rel="noopener">Reservar</a>`;
  }

  return `
        ${navLink('/reservas/', '/reservas', currentPath, 'Funciones')}
        ${navLink('/carta/', '/carta', currentPath, 'Carta')}
        ${navLink('/cursos/', '/cursos', currentPath, 'Cursos')}
        <a href="#contacto">Contacto</a>
        <a href="/reservas/" class="site-nav__cta">Reservar</a>`;
}

// Aviso temporal de vacaciones. Se muestra solo hasta el 2026-08-07 (según la
// fecha del visitante); después se oculta solo. Se puede borrar tras esa fecha.
const AVISO_VACACIONES = `
  <style>
    .aviso-vacaciones { background: var(--dorado, #D9B76A); color: var(--rojo-tinto, #6E1F18); font-family: var(--font-display, sans-serif); text-align: center; padding: 10px 16px; font-size: 0.92rem; font-weight: 700; line-height: 1.35; }
    .aviso-vacaciones strong { font-weight: 800; }
  </style>
  <div class="aviso-vacaciones" id="aviso-vacaciones" hidden>
    🌴 <strong>Vacaciones:</strong> no hay shows los viernes 24/7, 31/7 y 7/8. ¡Volvemos el <strong>viernes 14 de agosto</strong>!
  </div>
  <script>
    (function () {
      try {
        var ahora = new Date();
        var ar = new Date(ahora.getTime() - (ahora.getTimezoneOffset() + 180) * 60000);
        var hoy = ar.toISOString().slice(0, 10);
        if (hoy <= '2026-08-07') {
          var el = document.getElementById('aviso-vacaciones');
          if (el) el.hidden = false;
        }
      } catch (e) {}
    })();
  </script>`;

/**
 * Envuelve el contenido de una página en el layout completo.
 * opts: { title, description, url, image, bodyClass, extraCss, extraSchema,
 *         currentPath, content, year, noindex }
 *
 * noindex: true saca la página del índice de Google pero deja pasar los enlaces
 * ("noindex, follow"). Se usa en las funciones que ya pasaron: la página sigue
 * viva para no romper links viejos, pero deja de competir consigo misma.
 */
export function page(opts) {
  const title = opts.title ?? DEFAULT_TITLE;
  const description = opts.description ?? DEFAULT_DESC;
  const url = opts.url ?? BASE_URL + (opts.currentPath || '/');
  const image = opts.image ?? DEFAULT_IMAGE;
  const bodyClass = opts.bodyClass ?? '';
  const extraCss = opts.extraCss ?? '';
  const extraSchema = opts.extraSchema ?? '';
  const currentPath = opts.currentPath ?? '/';
  const year = opts.year ?? new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
${opts.noindex ? '  <meta name="robots" content="noindex, follow">\n' : ''}

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:locale" content="es_AR">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">

  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#B33227">

  <!-- CSS -->
  <link rel="stylesheet" href="/assets/css/base.css">
  ${extraCss ? `<link rel="stylesheet" href="${esc(extraCss)}">` : ''}
${ORG_SCHEMA}
  ${extraSchema || ''}
${TRACKING}
${TRACKING_JS}
${opts.funciones ? ESTADO_CSS + estadoScript(opts.funciones, !!opts.refrescarAgenda) : ''}
</head>
<body${bodyClass ? ` class="${esc(bodyClass)}"` : ''}>

  <header class="site-header">
    <div class="site-header__inner">
      <a href="/" class="site-header__logo" aria-label="Tres Empanadas Comedia, ir al inicio">
        <img src="/assets/img/logo.png" alt="Tres Empanadas Comedia" width="48" height="48">
        <span class="site-header__logo-text">
          Tres Empanadas
          <small>Comedia · La Plata</small>
        </span>
      </a>

      <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="site-nav" id="main-nav">
        ${renderNav(currentPath, opts)}
      </nav>
    </div>
  </header>
${AVISO_VACACIONES}
  <main>
${opts.content || ''}
  </main>

  <footer class="site-footer" id="contacto">
    <div class="site-footer__inner">

      <div class="site-footer__brand">
        <h3>Tres Empanadas Comedia</h3>
        <p>Microteatro de stand up en La Plata.</p>
        <p style="margin-top: var(--space-md);">
          Calle 43 N° 1349, esquina 22<br>
          La Plata, Buenos Aires<br>
          <a href="https://wa.me/5492215247488">WhatsApp 221 524-7488</a><br>
          <a href="mailto:info@tresempanadas.com.ar">info@tresempanadas.com.ar</a>
        </p>
        <p style="margin-top: var(--space-md);">
          Funciones jueves y viernes — 21:30hs
        </p>
      </div>

      <div>
        <h4>Más del proyecto</h4>
        <ul>
          <li><a href="https://nochesdestandup.com.ar">Noches de Stand Up — nuestra historia</a></li>
          <li><a href="https://aprendestandup.com.ar">Aprendé Stand Up — el curso</a></li>
        </ul>
      </div>

      <div>
        <h4>Seguinos</h4>
        <ul>
          <li><a href="https://www.instagram.com/tresempanadascomedia">Instagram</a></li>
          <li><a href="https://www.facebook.com/TresEmpanadasComedia">Facebook</a></li>
          <li><a href="${GOOGLE.url}">Google Maps · ${GOOGLE.nota} ⭐ (${GOOGLE.opiniones})</a></li>
        </ul>
      </div>

    </div>

    <div class="site-footer__bottom">
      <span>© ${year} Tres Empanadas Comedia</span>
      <span>Casa de Comedia · ¡Abrimos a veces!</span>
    </div>
  </footer>

  <!-- WhatsApp flotante -->
  <a href="https://wa.me/5492215247488" class="whatsapp-float" aria-label="Escribinos por WhatsApp" target="_blank" rel="noopener">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  </a>

  <style>
    .whatsapp-float {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: #25D366;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
      z-index: 99;
      transition: transform var(--t-base);
    }
    .whatsapp-float:hover {
      transform: scale(1.08);
      color: white;
    }
    @media (max-width: 768px) {
      .whatsapp-float {
        bottom: 16px;
        right: 16px;
      }
    }
  </style>

  <script>
    // Menú mobile toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const siteNav = document.querySelector('.site-nav');

    menuToggle?.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.site-nav a').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        menuToggle?.setAttribute('aria-expanded', false);
      });
    });
  </script>
${WSP_FLOTANTE_JS}
</body>
</html>`;
}

export { BASE_URL, SITE_NAME, DEFAULT_IMAGE };
