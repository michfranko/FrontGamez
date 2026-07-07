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
        calificacion TEXT,
        coverPath TEXT,
        bannerPath TEXT
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
  }
];
