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
   * Inicializa la conexión a la base de datos y aplica las migraciones pendientes.
   */
  async initialize(): Promise<void> {
    if (this.isDbInitialized) return;

    this.logger.info('Inicializando la conexión SQLite...');
    try {
      this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
      
      const isConnectionConsistent = await this.sqliteConnection.isConnection(this.dbName, false);
      if (isConnectionConsistent.result) {
        this.db = await this.sqliteConnection.retrieveConnection(this.dbName, false);
      } else {
        this.db = await this.sqliteConnection.createConnection(
          this.dbName,
          false, // no encriptado
          'no-encryption',
          1, // versión inicial de la conexión
          false // lectura/escritura
        );
      }

      await this.db.open();
      this.logger.info('Conexión de base de datos SQLite abierta correctamente.');

      // Habilitar claves foráneas
      await this.db.execute('PRAGMA foreign_keys = ON;');

      // Correr sistema de migraciones
      await this.runMigrations();

      this.isDbInitialized = true;
      this.logger.info('DatabaseManager inicializado correctamente.');
    } catch (err) {
      this.logger.error('Error al inicializar la base de datos SQLite', err);
      throw err;
    }
  }

  /**
   * Ejecuta las migraciones pendientes según PRAGMA user_version.
   */
  private async runMigrations(): Promise<void> {
    this.logger.info('Comprobando migraciones de base de datos...');
    
    try {
      // Obtener versión actual de la base de datos
      const res = await this.db.query('PRAGMA user_version;');
      let currentVersion = 0;
      if (res.values && res.values.length > 0) {
        // En SQLite el resultado de PRAGMA user_version viene como un objeto con la clave user_version
        currentVersion = Number(res.values[0].user_version) || 0;
      }
      this.logger.info(`Versión de base de datos actual: ${currentVersion}`);

      const pendingMigrations = MIGRATIONS.filter(m => m.version > currentVersion)
        .sort((a, b) => a.version - b.version);

      if (pendingMigrations.length === 0) {
        this.logger.info('La base de datos está actualizada. No hay migraciones pendientes.');
        return;
      }

      for (const migration of pendingMigrations) {
        this.logger.info(`Ejecutando migración versión ${migration.version}...`);
        await this.db.execute(migration.sql);
        
        // Actualizar la versión en SQLite
        await this.db.execute(`PRAGMA user_version = ${migration.version};`);
        this.logger.info(`Migración versión ${migration.version} aplicada con éxito.`);
      }
    } catch (err) {
      this.logger.error('Error al ejecutar las migraciones de base de datos', err);
      throw err;
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
