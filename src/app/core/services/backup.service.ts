import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { DatabaseManager } from '../database/database.manager';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  constructor(
    private dbManager: DatabaseManager,
    private logger: LoggerService
  ) {}

  /**
   * Exporta todo el esquema y los registros de SQLite a un archivo JSON en la carpeta de Documentos.
   * Retorna la ruta absoluta (URI) del archivo creado.
   */
  async exportDatabase(): Promise<string> {
    this.logger.info('Iniciando exportación de base de datos a JSON local...');
    try {
      const db = await this.dbManager.getDbConnection();
      
      // Exportar la base de datos a formato JSON compatible con el plugin
      const jsonExport = await db.exportToJson('full');
      
      if (!jsonExport || !jsonExport.export) {
        throw new Error('El plugin de SQLite retornó un JSON de exportación vacío.');
      }

      const jsonString = JSON.stringify(jsonExport.export);
      const fileName = `frontgamez_backup_${Date.now()}.json`;

      // Escribir el archivo en la carpeta Documentos del dispositivo
      const result = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      this.logger.info(`Base de datos exportada con éxito en: ${result.uri}`);
      return result.uri;
    } catch (err) {
      this.logger.error('Error durante la exportación de base de datos', err);
      throw err;
    }
  }

  /**
   * Importa y restaura la base de datos a partir del contenido de un archivo JSON de respaldo.
   * @param fileContent Contenido en texto plano (JSON string) del archivo de respaldo.
   */
  async importDatabaseContent(fileContent: string): Promise<void> {
    this.logger.info('Iniciando restauración de base de datos desde JSON...');
    try {
      const jsonObj = JSON.parse(fileContent);

      // 1. Cerrar conexión actual para realizar la importación limpia
      await this.dbManager.close();

      // 2. Obtener la conexión nativa
      const db = await this.dbManager.getDbConnection();
      
      // 3. Ejecutar la importación nativa usando la API del plugin instalada
      const nativeDb = db as typeof db & { importFromJson?: (payload: unknown) => Promise<unknown> };
      if (!nativeDb.importFromJson) {
        throw new Error('El plugin SQLite instalado no expone el método importFromJson en esta plataforma.');
      }
      await nativeDb.importFromJson(jsonObj);

      // 4. Reinicializar conexión y migraciones para asegurar consistencia
      await this.dbManager.initialize();
      this.logger.info('Base de datos restaurada correctamente.');
    } catch (err) {
      this.logger.error('Error al restaurar base de datos desde JSON', err);
      throw err;
    }
  }
}
