/**
 * Cliente mínimo de la GitHub Contents API para el admin.
 *
 * El panel de cocina guarda cada show como archivo JSON (y sube flyers) haciendo
 * commits al repositorio. Cada commit dispara el rebuild de Cloudflare Pages, que
 * regenera las páginas estáticas. Los datos siguen viviendo como archivos en Git
 * (que es, además, el backup).
 *
 * Variables de entorno necesarias:
 *   GITHUB_TOKEN   — fine-grained PAT con permiso Contents: Read and write
 *   GITHUB_REPO    — "owner/repo" (ej: "checho/tresempanadas")
 *   GITHUB_BRANCH  — rama a commitear (default "main")
 */

const API = 'https://api.github.com';

function cfg(env) {
  const repo = env.GITHUB_REPO;
  const token = env.GITHUB_TOKEN;
  const branch = env.GITHUB_BRANCH || 'main';
  if (!repo || !token) {
    throw new Error('Falta configurar GITHUB_REPO y/o GITHUB_TOKEN en Cloudflare.');
  }
  return { repo, token, branch };
}

async function ghFetch(env, method, apiPath, body) {
  const { token } = cfg(env);
  const res = await fetch(`${API}${apiPath}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tresempanadas-cocina',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function b64ToUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Lee un archivo. Devuelve { sha, text } o null si no existe. */
export async function getFile(env, path) {
  const { repo, branch } = cfg(env);
  const res = await ghFetch(env, 'GET', `/repos/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path}: HTTP ${res.status}`);
  const data = await res.json();
  return { sha: data.sha, text: data.content ? b64ToUtf8(data.content) : '' };
}

/** Lista archivos de un directorio. Devuelve [{ name, path, sha }]. */
export async function listDir(env, path) {
  const { repo, branch } = cfg(env);
  const res = await ghFetch(env, 'GET', `/repos/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list ${path}: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter((e) => e.type === 'file').map((e) => ({ name: e.name, path: e.path, sha: e.sha }));
}

/** Crea o actualiza un archivo de texto. */
export async function putTextFile(env, path, text, message, sha) {
  return putRaw(env, path, utf8ToB64(text), message, sha);
}

/** Crea o actualiza un archivo binario (content ya en base64). */
export async function putBase64File(env, path, base64, message, sha) {
  return putRaw(env, path, base64, message, sha);
}

async function putRaw(env, path, contentB64, message, sha) {
  const { repo, branch } = cfg(env);
  const body = { message, content: contentB64, branch };
  if (sha) body.sha = sha;
  const res = await ghFetch(env, 'PUT', `/repos/${repo}/contents/${encodePath(path)}`, body);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub PUT ${path}: HTTP ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

/** Borra un archivo. Necesita el sha actual. */
export async function deleteFile(env, path, message, sha) {
  const { repo, branch } = cfg(env);
  const res = await ghFetch(env, 'DELETE', `/repos/${repo}/contents/${encodePath(path)}`, { message, sha, branch });
  if (!res.ok && res.status !== 404) {
    const t = await res.text();
    throw new Error(`GitHub DELETE ${path}: HTTP ${res.status} ${t.slice(0, 200)}`);
  }
  return true;
}

/** Lee y parsea todos los eventos del repo. Devuelve array de objetos. */
export async function loadEventosFromRepo(env) {
  const files = await listDir(env, 'data/eventos');
  const eventos = [];
  for (const f of files) {
    if (!f.name.endsWith('.json')) continue;
    try {
      const file = await getFile(env, f.path);
      const data = JSON.parse(file.text);
      data.id = f.name.replace(/\.json$/, '');
      data._sha = file.sha;
      eventos.push(data);
    } catch { /* omitir ilegible */ }
  }
  return eventos;
}

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}
