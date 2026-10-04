-- Sistema de pedidos (carta + panel). Base D1 propia, independiente de todo lo anterior.
CREATE TABLE productos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio INTEGER NOT NULL CHECK (precio >= 0),
  -- ninguno: sin control | hayno: tirada (hay / no hay) | cantidad: stock exacto
  control TEXT NOT NULL CHECK (control IN ('ninguno','hayno','cantidad')),
  -- auto: descuenta solo | manual: lo maneja el dueño a mano (no descuenta)
  modo TEXT NOT NULL DEFAULT 'auto' CHECK (modo IN ('auto','manual')),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  disponible INTEGER NOT NULL DEFAULT 1 CHECK (disponible IN (0,1)),
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
  orden INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE jornadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  abierta_en TEXT NOT NULL,
  cerrada_en TEXT
);

CREATE TABLE pedidos (
  id TEXT PRIMARY KEY,                -- UUID generado por el cliente: evita duplicados
  jornada_id INTEGER NOT NULL REFERENCES jornadas(id),
  mesa TEXT NOT NULL,
  dispositivo TEXT,
  origen TEXT NOT NULL DEFAULT 'cliente' CHECK (origen IN ('cliente','barra')),
  creado_en TEXT NOT NULL,
  anulado_en TEXT
);
CREATE INDEX idx_pedidos_jornada ON pedidos(jornada_id, mesa);

CREATE TABLE renglones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id),
  producto_id TEXT NOT NULL REFERENCES productos(id),
  nombre TEXT NOT NULL,
  precio INTEGER NOT NULL,            -- precio al momento del pedido
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  entregadas INTEGER NOT NULL DEFAULT 0,
  CHECK (entregadas >= 0 AND entregadas <= cantidad)
);
CREATE INDEX idx_renglones_pedido ON renglones(pedido_id);

CREATE TABLE cuentas (
  jornada_id INTEGER NOT NULL REFERENCES jornadas(id),
  mesa TEXT NOT NULL,
  pagada_en TEXT,
  medio TEXT,
  PRIMARY KEY (jornada_id, mesa)
);

CREATE TABLE movimientos_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id TEXT NOT NULL,
  delta INTEGER NOT NULL,
  motivo TEXT NOT NULL,               -- carga, pedido, anulacion, ajuste
  pedido_id TEXT,
  creado_en TEXT NOT NULL
);

-- Tabla auxiliar: un INSERT con ok NULL hace fallar todo el lote (sirve de "guardia").
CREATE TABLE guardia (ok INTEGER NOT NULL);
