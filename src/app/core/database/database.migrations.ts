export interface Migration {
  version: number;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        tipo TEXT,
        estado TEXT,
        version TEXT,
        plataforma TEXT,
        prioridad TEXT,
        fechaIncorporacion TEXT,
        fechaFinalizacion TEXT,
        anioLanzamiento TEXT,
        calificacion TEXT
      );

      CREATE TABLE IF NOT EXISTS reviews (
        game_id TEXT PRIMARY KEY,
        calificacion TEXT NOT NULL,
        texto TEXT NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS wishlist (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        plataforma TEXT,
        prioridad TEXT,
        notas TEXT,
        fechaAgregado TEXT
      );

      CREATE TABLE IF NOT EXISTS shopping_lists (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        fechaCreacion TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS shopping_items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        precio REAL DEFAULT 0,
        comprado INTEGER DEFAULT 0,
        FOREIGN KEY (list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS platforms (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS genres (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS statistics (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `
  },
  {
    version: 2,
    sql: `
      -- Migración Versión 2: Índices de rendimiento (no modifica datos)
      CREATE INDEX IF NOT EXISTS idx_games_estado ON games(estado);
      CREATE INDEX IF NOT EXISTS idx_games_plataforma ON games(plataforma);
      CREATE INDEX IF NOT EXISTS idx_shopping_items_list ON shopping_items(list_id);
    `
  },
  {
    version: 3,
    sql: `
      -- Migración Versión 3: Agregar campos de precio, impuesto y tienda a wishlist y shopping_items
      -- Nota: SQLite no soporta ADD COLUMN con constrains complejas, se usa DEFAULT seguro.

      ALTER TABLE wishlist ADD COLUMN precioBase REAL DEFAULT 0;

      ALTER TABLE shopping_items ADD COLUMN precioBase REAL DEFAULT 0;
      ALTER TABLE shopping_items ADD COLUMN tienda TEXT DEFAULT '';
      ALTER TABLE shopping_items ADD COLUMN porcentajeImpuesto REAL DEFAULT 0;
      ALTER TABLE shopping_items ADD COLUMN cantidad INTEGER DEFAULT 1;

      -- Insertar configuración inicial de impuestos por tienda (si no existen)
      INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_amazon', '10');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_playstation', '15');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_steam', '15');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_nintendo', '10');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_xbox', '10');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_epic', '0');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_otra', '0');
    `
  },
  {
    version: 4,
    sql: `
      ALTER TABLE shopping_items ADD COLUMN seleccionado INTEGER DEFAULT 0;
      ALTER TABLE shopping_items ADD COLUMN origenWishlist INTEGER DEFAULT 0;
      ALTER TABLE shopping_lists ADD COLUMN presupuesto REAL DEFAULT 0;
    `
  },
  {
    version: 5,
    sql: `
      -- Migración Versión 5: GameVault 2.0 - Campos de Favorito, GameId y Soporte de Colección
      ALTER TABLE games ADD COLUMN favorito INTEGER DEFAULT 0;
      ALTER TABLE games ADD COLUMN gameId TEXT DEFAULT '';

      CREATE INDEX IF NOT EXISTS idx_games_favorito ON games(favorito);
      CREATE INDEX IF NOT EXISTS idx_games_gameId ON games(gameId);
    `
  }
];

