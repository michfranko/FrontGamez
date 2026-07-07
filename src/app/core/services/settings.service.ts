import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseManager } from '../database/database.manager';
import { AppSettings } from '../../models/entities/settings.model';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private defaultSettings: AppSettings = {
    tema: 'system',
    idioma: 'es',
    formatoFecha: 'YYYY-MM-DD',
    moneda: 'USD'
  };

  private settingsSubject = new BehaviorSubject<AppSettings>(this.defaultSettings);
  settings$: Observable<AppSettings> = this.settingsSubject.asObservable();

  constructor(
    private db: DatabaseManager,
    private logger: LoggerService
  ) {
    this.loadSettings();
  }

  /**
   * Carga la configuración desde la tabla 'settings' y actualiza el estado en memoria.
   */
  async loadSettings(): Promise<void> {
    try {
      this.logger.info('Cargando configuraciones desde SQLite...');
      const rows = await this.db.query('SELECT * FROM settings');
      const loaded: Partial<AppSettings> = {};
      
      rows.forEach((row: any) => {
        if (row.key === 'tema' || row.key === 'idioma' || row.key === 'formatoFecha' || row.key === 'moneda') {
          loaded[row.key as keyof AppSettings] = row.value as any;
        }
      });

      const currentSettings: AppSettings = {
        ...this.defaultSettings,
        ...loaded
      };
      
      this.settingsSubject.next(currentSettings);
      this.logger.info('Configuraciones de la aplicación aplicadas:', currentSettings);
    } catch (err) {
      this.logger.error('Error al cargar configuraciones de base de datos', err);
    }
  }

  /**
   * Actualiza el valor de una clave de configuración en SQLite y en memoria.
   */
  async setSetting(key: keyof AppSettings, value: string): Promise<void> {
    this.logger.info(`Actualizando configuración: ${key} = ${value}`);
    try {
      await this.db.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
      
      const updatedSettings = {
        ...this.settingsSubject.value,
        [key]: value
      } as AppSettings;
      
      this.settingsSubject.next(updatedSettings);
    } catch (err) {
      this.logger.error(`Error al guardar configuración ${key} en SQLite`, err);
    }
  }

  /**
   * Obtiene la configuración actual en memoria de forma sincrónica.
   */
  getSettingsSync(): AppSettings {
    return this.settingsSubject.value;
  }
}
