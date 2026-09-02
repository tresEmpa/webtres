/** Home — port de index.php */
import { page } from './layout.mjs';

const FAQ_SCHEMA = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type":"Question","name":"¿Hay que reservar?","acceptedAnswer":{"@type":"Answer","text":"Sí, conviene. Es gratis y te asegura la mesa. Las reservas vencen 21:45hs."}},
    {"@type":"Question","name":"¿Cuánto cuesta?","acceptedAnswer":{"@type":"Answer","text":"El show es a la gorra. No es gratis, es con onda. Aportás lo que puedas al final."}},
    {"@type":"Question","name":"¿Qué hay para tomar y comer?","acceptedAnswer":{"@type":"Answer","text":"Empanadas, snacks, cinco cervezas artesanales de barril, latas y opciones sin alcohol. Somos un teatrito, no un resto."}},
    {"@type":"Question","name":"¿Hay opciones sin TACC?","acceptedAnswer":{"@type":"Answer","text":"No tenemos menú celiaco, pero podés traer tu propia comida. Sin drama."}},
    {"@type":"Question","name":"¿Aceptan tarjeta?","acceptedAnswer":{"@type":"Answer","text":"Aceptamos efectivo, tarjeta, QR y transferencia."}},
    {"@type":"Question","name":"¿Pueden venir menores?","acceptedAnswer":{"@type":"Answer","text":"Es para adultos. El humor y el ambiente no son para menores."}},
    {"@type":"Question","name":"¿Festejos?","acceptedAnswer":{"@type":"Answer","text":"Despedidas, cumples, casamientos, divorcios. Festejamos cualquier cosa, menos velorios. Escribinos por WhatsApp."}}
  ]
}
</script>`;

function semaforo(aria) {
  return `<div class="semaforo" aria-label="${aria}">
        <div class="semaforo__row semaforo__row--verde">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">21:00</span>
          <span class="semaforo__label">Tempranito</span>
        </div>
        <div class="semaforo__row semaforo__row--amarillo">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">21:30</span>
          <span class="semaforo__label">Bien, justito</span>
        </div>
        <div class="semaforo__row semaforo__row--naranja">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">21:45</span>
          <span class="semaforo__label">Vencen reservas</span>
        </div>
        <div class="semaforo__row semaforo__row--rojo">
          <span class="semaforo__dot" aria-hidden="true"></span>
          <span class="semaforo__hora">22:01</span>
          <span class="semaforo__label">No se entra más</span>
        </div>
      </div>`;
}

export function renderHome(year) {
  const content = `
<!-- ============= APERTURA ============= -->
<section class="apertura">
  <div class="apertura__inner">

    <h1 class="apertura__claim">
      Vení a reír.
      <em>Elegínos para pasarla bien.</em>
    </h1>

    <p class="apertura__intro">Somos esto:</p>

    <p class="apertura__lista">
      <span>Excelentes espectáculos de stand up.</span>
      <span>Deliciosas empanadas.</span>
      <span>Buena cerveza de barril.</span>
      <span>Precios accesibles.</span>
      <span>Cálida bienvenida.</span>
      <span>Atmósfera relajada.</span>
      <span>Ideal para disfrutar con amigos y familia.</span>
    </p>

    <p class="apertura__pie">
      Lo dicen nuestros visitantes en
      <a href="https://share.google/dyTTJVXR25JTlU7kX" target="_blank" rel="noopener">las reseñas de Google</a>.
    </p>

    <figure class="apertura__foto" aria-hidden="true">
      <img src="/assets/img/publico.jpg" alt="">
      <figcaption>Una noche cualquiera</figcaption>
    </figure>

  </div>
</section>

<!-- ============= DIVISOR MONDRIAN ============= -->
<div class="mondrian-divider" aria-hidden="true">
  <div></div><div></div><div></div><div></div><div></div>
</div>

<!-- ============= CUÁNDO Y DÓNDE ============= -->
<section class="cuando-donde" aria-label="Información práctica">
  <div class="cuando-donde__inner">

    <div class="cuando-donde__bloque">
      <h3>Cuándo</h3>
      <ul>
        <li><strong>Todos los viernes</strong></li>
        <li>Muchos jueves</li>
        <li>Algún martes</li>
      </ul>
      <span class="hora">21:30 Hs.</span>
    </div>

    <div class="cuando-donde__bloque">
      <h3>Dónde</h3>
      <p>
        <strong>Calle 43 N° 1349</strong><br>
        Esquina 22 · La Plata
      </p>
    </div>

  </div>
</section>

<!-- ============= CÓMO ES VENIR ============= -->
<section class="como-es-venir">
  <div class="como-es-venir__inner">

    <div class="como-es-venir__texto">
      <h2>Microteatro de stand up en La Plata</h2>

      <p>
        <strong>Tres Empanadas Comedia</strong> es un microteatro de stand up en La Plata.
        Una sala chica, íntima y con onda, donde el público está cerca
        y cada noche se vive distinta. Acá se mezclan comediantes con años
        de escenario, nuevas voces de la ciudad y shows que van cambiando
        semana a semana.
      </p>

      <p>
        Los viernes es el turno de la
        <strong><a href="https://nochesdestandup.com.ar" target="_blank" rel="noopener">Sociedad Platense de Stand Up</a></strong>,
        la productora de stand up en La Plata desde 2013.
        Los jueves rotan fechas especiales, funciones de alumnos y propuestas nuevas.
      </p>

      <p>
        El show es <em>a la gorra</em>: venís, te reís y al final aportás lo que te
        pareció la experiencia. Hay empanadas, cerveza tirada, latas y opciones
        sin alcohol para acompañar la noche.
      </p>

      <p>
        No somos un restaurante ni un bar gigante. Somos un
        <strong>club de comedia independiente</strong> hecho para escuchar,
        reírse y pasarla bien. Funciona perfecto para venir solo, en pareja
        o con amigos.
      </p>
    </div>

    <div class="como-es-venir__galeria">
      <figure class="como-es-venir__foto como-es-venir__foto--rotated">
        <img src="/assets/img/escenario-mondrian.jpg" alt="Escenario de Tres Empanadas con mural Mondrian al fondo">
      </figure>
      <figure class="como-es-venir__foto como-es-venir__foto--rotated-r">
        <img src="/assets/img/interior-publico.jpg" alt="Público en una función de stand up en Tres Empanadas">
      </figure>
    </div>

  </div>
</section>

<!-- ============= ESTA SEMANA ============= -->
<section class="esta-semana" id="esta-semana">

  <div class="esta-semana__header">
    <h2>Esta semana</h2>
    <p>Funciones jueves y viernes — 21:30hs</p>
  </div>

  <div class="esta-semana__grid">

    <article class="show-card show-card--viernes">
      <span class="show-card__day">Viernes 21:30</span>
      <h3>Sociedad Platense de Stand Up</h3>
      <p class="show-card__sub">El clásico de los viernes</p>

      ${semaforo('Horarios del viernes')}

      <a href="/reservas/viernes/" class="btn btn-primary">Reservar</a>
    </article>

    <article class="show-card show-card--jueves">
      <span class="show-card__day">Jueves 21:30</span>
      <h3>El Rotativo Platense</h3>
      <p class="show-card__sub">Cada semana con distintos comediantes invitados</p>

      ${semaforo('Horarios del jueves')}

      <a href="/reservas/jueves/" class="btn btn-violeta">Reservar</a>
    </article>

  </div>
</section>

<!-- ============= RESERVAR CTA ============= -->
<section class="reservar-cta">
  <div class="reservar-cta__inner">
    <div>
      <h3>Conviene reservar</h3>
      <p><em>Es gratis</em> y te asegura la mesa. Los lugares vuelan.</p>
    </div>
    <a href="/reservas/" class="btn btn-primary">Reservar mesa →</a>
  </div>
</section>

<!-- ============= CURSO CTA ============= -->
<style>
  .curso-banner { background: var(--rojo, #B33227); color: var(--crema, #F1E8D2); padding: clamp(2rem, 6vw, 3.5rem) 1rem; text-align: center; }
  .curso-banner__inner { max-width: 640px; margin: 0 auto; }
  .curso-banner__badge { display: inline-block; background: var(--dorado, #D9B76A); color: var(--rojo-tinto, #6E1F18); font-family: var(--font-display); font-weight: 800; font-size: 0.8rem; letter-spacing: 0.04em; padding: 6px 14px; border-radius: 999px; margin-bottom: 1rem; text-transform: uppercase; }
  .curso-banner h2 { font-family: var(--font-display); font-size: clamp(1.4rem, 5vw, 2rem); line-height: 1.15; margin-bottom: 0.6rem; color: var(--crema, #F1E8D2); }
  .curso-banner p { font-family: var(--font-body); font-size: 1.05rem; line-height: 1.5; margin-bottom: 1.4rem; opacity: 0.92; }
  .curso-banner__btn { display: inline-block; background: var(--dorado, #D9B76A) !important; color: var(--rojo-tinto, #6E1F18) !important; border: none; font-family: var(--font-display); font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; padding: 15px 28px; border-radius: var(--radius, 8px); text-decoration: none; box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
  .curso-banner__btn:hover { transform: translateY(-1px); }
</style>
<section class="curso-banner">
  <div class="curso-banner__inner">
    <span class="curso-banner__badge">🔥 Cupos limitados · Arranca jueves 13/8</span>
    <h2>¿Y si el próximo en el escenario sos vos?</h2>
    <p>Curso de stand up en La Plata: aprendé a escribir, probá tu material y subite al escenario. Cuota $35.000 por mes.</p>
    <a href="/cursos/#inscripcion" class="curso-banner__btn">Anotarme al curso →</a>
  </div>
</section>

<!-- ============= DIVISOR MONDRIAN ============= -->
<div class="mondrian-divider" aria-hidden="true">
  <div></div><div></div><div></div><div></div><div></div>
</div>

<!-- ============= INFO ÚTIL ============= -->
<section class="info-util">

  <div class="info-util__header">
    <h2>Tenés que saber</h2>
    <p>Lo justo para que vengas tranquilo.</p>
  </div>

  <div class="info-util__grid">

    <div class="info-item">
      <h3>Adultos</h3>
      <p>El humor y el ambiente no son para menores.</p>
    </div>

    <div class="info-item">
      <h3>Somos un teatrito, no un resto</h3>
      <p>Acá se viene a reír. La comida y la birra son riquísimas pero acompañan.</p>
    </div>

    <div class="info-item">
      <h3>El show es a la gorra</h3>
      <p>No es gratis, es con onda. Aportás lo que puedas al final. <strong>Efectivo, tarjeta, QR o transferencia.</strong></p>
    </div>

    <div class="info-item">
      <h3>Qué hay para comer y tomar</h3>
      <p>Empanadas, snacks, cinco cervezas artesanales de barril, latas y opciones sin alcohol. <a href="/carta/">Ver carta</a>.</p>
    </div>

    <div class="info-item">
      <h3>Festejos</h3>
      <p>Cumples, despedidas, casamientos, divorcios. <strong>Festejamos cualquier cosa, menos velorios.</strong> <a href="https://wa.me/5492215247488?text=Consulta%20por%20festejos">Escribinos</a>.</p>
    </div>

    <div class="info-item">
      <h3>Venir solo</h3>
      <p>Mucha gente lo hace. Hay barra y siempre se conoce a alguien. La idea es reírse.</p>
    </div>

    <div class="info-item">
      <h3>Reservar es gratis</h3>
      <p>Y te asegura la mesa. <strong>Conviene</strong> — el corazón es grande pero la casa es chica. <a href="/reservas/">Reservá acá</a>.</p>
    </div>

    <div class="info-item">
      <h3>Sin TACC</h3>
      <p>No tenemos menú celiaco. Pero <strong>podés traer tu comida</strong>. Sin drama.</p>
    </div>

  </div>
</section>

<!-- ============= CIERRE ============= -->
<section class="cierre">
  <div class="cierre__inner">
    <h2>
      ¿Te reíste hasta llorar?
      <em>Avisale a tus amigos.</em>
    </h2>
    <p>¿No te gustó? Avisale a tus enemigos.</p>
    <a href="https://g.page/r/CcRc7MWoc9jTEBM/review"
       target="_blank" rel="noopener"
       class="btn btn-primary">
      Dejanos una reseña en Google →
    </a>
  </div>
</section>
`;

  return page({
    title: 'Tres Empanadas Comedia | Microteatro de Stand Up en La Plata',
    description: 'Vení a reír. Microteatro de stand up en La Plata. Funciones jueves y viernes 21:30hs. Reservá gratis.',
    url: 'https://tresempanadas.com.ar/',
    image: 'https://tresempanadas.com.ar/assets/img/og-default.jpg',
    bodyClass: 'page-home',
    extraCss: '/assets/css/home.css',
    extraSchema: FAQ_SCHEMA,
    currentPath: '/',
    content,
    year,
  });
}
