/** 404 — port de 404.php */
import { page } from './layout.mjs';

export function renderNotFound(year) {
  const content = `
<style>
.error-404 {
  padding: var(--space-xxl) var(--space-md);
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.error-404__num {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(5rem, 18vw, 12rem);
  line-height: 0.85;
  color: var(--rojo);
  margin-bottom: var(--space-md);
  letter-spacing: -0.04em;
}
.error-404 h1 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  margin-bottom: var(--space-sm);
  max-width: 20ch;
}
.error-404 p {
  font-family: var(--font-body);
  font-size: 1.0625rem;
  color: var(--gris-text);
  max-width: 40ch;
  margin-bottom: var(--space-lg);
}
.error-404__buttons {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  justify-content: center;
}
</style>

<section class="error-404">
  <div class="error-404__num">404</div>
  <h1>Esta página no existe.</h1>
  <p>
    Tal vez la borramos, tal vez nunca existió, tal vez te pasamos mal el link.
    Lo importante es que el show sigue.
  </p>
  <div class="error-404__buttons">
    <a href="/" class="btn btn-primary">Volver al inicio</a>
    <a href="/reservas/" class="btn btn-ghost">Ver funciones</a>
  </div>
</section>
`;

  return page({
    title: '404 — Esta página no existe | Tres Empanadas Comedia',
    description: 'Esta página no existe.',
    url: 'https://tresempanadas.com.ar/404',
    bodyClass: 'page-404',
    currentPath: '/404',
    content,
    year,
  });
}
