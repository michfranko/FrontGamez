import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../core/services/settings.service';
import { BackupService } from '../core/services/backup.service';
import { ToastService } from '../core/services/toast.service';
import { AppSettings } from '../models/entities/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settings: AppSettings = {
    tema: 'system',
    idioma: 'es',
    formatoFecha: 'YYYY-MM-DD',
    moneda: 'USD'
  };

  backupJsonInput: string = '';
  lastBackupPath: string = '';
  isExporting = false;
  isImporting = false;

  private settingsService = inject(SettingsService);
  private backupService = inject(BackupService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.settingsService.settings$.subscribe((s) => {
      this.settings = { ...s };
    });
  }

  async updateSetting(key: keyof AppSettings, value: string) {
    await this.settingsService.setSetting(key, value);
    this.toastService.success('Ajuste actualizado con éxito');
  }

  async exportBackup() {
    this.isExporting = true;
    try {
      const uri = await this.backupService.exportDatabase();
      this.lastBackupPath = uri;
      this.toastService.success('Copia de seguridad exportada con éxito');
    } catch (err: any) {
      this.toastService.error('Error al exportar base de datos: ' + (err?.message || err));
    } finally {
      this.isExporting = false;
    }
  }

  async importBackup() {
    if (!this.backupJsonInput.trim()) {
      this.toastService.warning('Ingresa el contenido JSON para importar');
      return;
    }

    if (!confirm('ADVERTENCIA: La restauración sobrescribirá los datos actuales de la base de datos. ¿Deseas continuar?')) {
      return;
    }

    this.isImporting = true;
    try {
      await this.backupService.importDatabaseContent(this.backupJsonInput);
      this.toastService.success('Base de datos restaurada correctamente');
      this.backupJsonInput = '';
    } catch (err: any) {
      this.toastService.error('Error al importar base de datos: ' + (err?.message || err));
    } finally {
      this.isImporting = false;
    }
  }
}
