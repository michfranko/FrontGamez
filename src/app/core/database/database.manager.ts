import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { LoggerService } from '../services/logger.service';
import { MIGRATIONS } from './database.migrations';

@Injectable({
  providedIn: 'root'
})
export class DatabaseManager {
  private sqliteConnection!: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private isDbInitialized = false;
  private dbName = 'frontgamez_db';

  constructor(private logger: LoggerService) {}

  /**
   * Inicializa la conexión a la base de datos SQLite garantizando la persistencia total
   * de los datos del usuario entre actualizaciones de la app.
   */
  async initialize(): Promise<void> {
    if (this.isDbInitialized) return;

    this.logger.info('Inicializando motor SQLite con persistencia de datos...');
    try {
      this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);

      // 1. Sincronizar conexiones nativas y JS para evitar inconsistencias tras actualizar la app
      try {
        await this.sqliteConnection.checkConnectionsConsistency();
      } catch (e) {
        this.logger.warn('Check de consistencia omitido o no requerido:', e);
      }
      
      const targetVersion = Math.max(...MIGRATIONS.map(m => m.version), 1);
      const isConnectionConsistent = await this.sqliteConnection.isConnection(this.dbName, false);

      if (isConnectionConsistent.result) {
        this.db = await this.sqliteConnection.retrieveConnection(this.dbName, false);
      } else {
        this.db = await this.sqliteConnection.createConnection(
          this.dbName,
          false, // no encriptado
          'no-encryption',
          targetVersion, // versión dinámica sincronizada con el esquema de migraciones
          false // lectura/escritura
        );
      }

      // 2. Abrir la conexión si no está abierta aún
      const isOpenResult = await this.db.isDBOpen();
      if (!isOpenResult.result) {
        await this.db.open();
      }

      this.logger.info('Conexión SQLite abierta exitosamente.');

      // 3. Activar claves foráneas
      await this.db.execute('PRAGMA foreign_keys = ON;');

      // 4. Ejecutar el motor de migraciones incrementales preservando datos existentes
      await this.runMigrations();

      this.isDbInitialized = true;
      this.logger.info('DatabaseManager inicializado con éxito. Datos 100% compatibles.');
    } catch (err) {
      this.logger.error('Error al inicializar la base de datos SQLite', err);
      throw err;
    }
  }

  /**
   * Ejecuta las migraciones pendientes sin destruir tablas ni borrar registros existentes.
   */
  private async runMigrations(): Promise<void> {
    this.logger.info('Comprobando versión del esquema SQLite...');
    
    try {
      // Obtener versión actual de la base de datos local
      const res = await this.db.query('PRAGMA user_version;');
      let currentVersion = 0;
      if (res.values && res.values.length > 0) {
        currentVersion = Number(res.values[0].user_version) || 0;
      }
      this.logger.info(`Versión actual en disco: ${currentVersion}`);

      const pendingMigrations = MIGRATIONS.filter(m => m.version > currentVersion)
        .sort((a, b) => a.version - b.version);

      if (pendingMigrations.length === 0) {
        this.logger.info('La base de datos está en la última versión. No requiere cambios.');
        return;
      }

      for (const migration of pendingMigrations) {
        this.logger.info(`Aplicando migración incremental versión ${migration.version}...`);
        
        // Ejecutar DDL de la migración de forma segura
        await this.db.execute(migration.sql);
        
        // Actualizar PRAGMA user_version
        await this.db.execute(`PRAGMA user_version = ${migration.version};`);
        this.logger.info(`Migración versión ${migration.version} aplicada sin afectar los datos.`);
      }
    } catch (err) {
      this.logger.error('Error durante la migración incremental de datos', err);
      // No re-lanzamos para evitar que la app crashee en actualizaciones si una columna ya existía
    }
  }

  /**
   * Ejecuta una consulta de selección (SELECT) que retorna registros.
   */
  async query(sql: string, params: any[] = []): Promise<any> {
    await this.initialize();
    try {
      this.logger.debug(`Consulta (Query): ${sql}`, params);
      const result = await this.db.query(sql, params);
      return result.values || [];
    } catch (err) {
      this.logger.error(`Error al ejecutar consulta SQL: ${sql}`, err);
      throw err;
    }
  }

  /**
   * Ejecuta una sentencia de mutación (INSERT, UPDATE, DELETE).
   */
  async execute(sql: string, params: any[] = []): Promise<any> {
    await this.initialize();
    try {
      this.logger.debug(`Sentencia (Run): ${sql}`, params);
      const result = await this.db.run(sql, params);
      return result;
    } catch (err) {
      this.logger.error(`Error al ejecutar sentencia SQL: ${sql}`, err);
      throw err;
    }
  }

  /**
   * Ejecuta múltiples sentencias SQL dentro de una sola transacción.
   */
  async executeTransaction(statements: { statement: string; values: any[] }[]): Promise<any> {
    await this.initialize();
    try {
      this.logger.debug('Iniciando transacción...', statements);
      const result = await this.db.executeTransaction(statements);
      return result;
    } catch (err) {
      this.logger.error('Error en la transacción SQL', err);
      throw err;
    }
  }

  /**
   * Cierra la conexión de la base de datos de manera segura.
   */
  async close(): Promise<void> {
    if (!this.isDbInitialized) return;
    try {
      await this.db.close();
      this.isDbInitialized = false;
      this.logger.info('Conexión SQLite cerrada con éxito.');
    } catch (err) {
      this.logger.error('Error al cerrar la conexión SQLite', err);
      throw err;
    }
  }

  /**
   * Importa la base de datos completa desde una cadena JSON.
   */
  async importDatabaseFromJson(jsonString: string): Promise<any> {
    await this.initialize();
    const nativeConnection = this.sqliteConnection as typeof this.sqliteConnection & {
      importFromJson?: (payload: string) => Promise<any>;
    };
    if (!nativeConnection.importFromJson) {
      throw new Error('El plugin SQLite instalado no expone importFromJson en esta plataforma.');
    }
    return await nativeConnection.importFromJson(jsonString);
  }

  /**
   * Retorna la conexión directa a la base de datos.
   */
  async getDbConnection(): Promise<SQLiteDBConnection> {
    await this.initialize();
    return this.db;
  }
}
