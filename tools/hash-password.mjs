/**
 * Genera el hash de una contraseña para el panel de cocina.
 *
 * Uso:
 *   node tools/hash-password.mjs "mi-contraseña-nueva"
 *
 * Copiá la línea que empieza con "pbkdf2$..." y pegala en Cloudflare como el
 * valor de la variable de entorno COCINA_PASS_HASH (marcala como "secreto").
 */

import { hashPassword } from '../functions/_lib/auth.js';

const pass = process.argv[2];
if (!pass) {
  console.error('Falta la contraseña.\n\n  node tools/hash-password.mjs "tu-contraseña"\n');
  process.exit(1);
}

const hash = await hashPassword(pass);
console.log('\nCOCINA_PASS_HASH =');
console.log(hash);
console.log('\nPegá ese valor en Cloudflare (Settings → Environment variables → secreto).\n');
