-- Credenciales del panel guardadas en la base (alternativa a los secretos de Cloudflare, útil en Vista previa).
CREATE TABLE config (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
