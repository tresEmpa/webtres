/**
 * INTENSIVO DE ARRANQUE — datos de la próxima edición, en un solo lugar.
 *
 * Para repetirlo (otro feriado, un sábado): cambiá `fecha`, `fechaTexto` y,
 * si hace falta, `horario` y `precio`. El resto del sitio lee de acá.
 *
 * Sin edición programada: poné `fecha: null`. La página /intensivo/ pasa a
 * "Próximo intensivo a confirmar" y el aviso de /cursos/ desaparece.
 *
 * La edición se da por vencida sola al día siguiente de `fecha` (hora AR, la
 * del build). No hace falta acordarse de apagarla.
 *
 * Interno, no se publica: tope 15 personas; se hace aunque vengan 2; si alguien
 * no viene y pide la plata, se le devuelve. El trabajo de imagen / elefante
 * no se anuncia.
 */
export const INTENSIVO = {
  nombre: 'Intensivo de arranque',
  fecha: '2026-11-19',                       // AAAA-MM-DD, o null
  fechaTexto: 'jueves 19 de noviembre',
  fechaNota: 'feriado en La Plata',           // '' si no aplica
  horario: '16 a 20 hs',
  horaInicio: '16:00',
  horaFin: '20:00',
  precio: '$50.000',
  precioNumero: 50000,
  showNoche: '21:30',                         // '' si esa noche no hay show
  // A dónde lleva "Anotarme". Mientras no esté la inscripción de Aprende,
  // abre WhatsApp. Cuando esté, va acá la URL de la inscripción.
  inscripcionUrl: null,
};

/** ¿Hay una edición vigente (hoy o en el futuro) a la fecha del build? */
export function intensivoVigente(now = new Date()) {
  if (!INTENSIVO.fecha) return false;
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  return INTENSIVO.fecha >= hoy;
}
