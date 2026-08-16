import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../core/services/settings.service';
import { TranslationService } from '../core/services/translation.service';
import { ToastService } from '../core/services/toast.service';
import { AppSettings } from '../models/entities/settings.model';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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

  private settingsService = inject(SettingsService);
  private translationService = inject(TranslationService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.settingsService.settings$.subscribe((s) => {
      this.settings = { ...s };
    });
  }

  async updateSetting(key: keyof AppSettings, value: string) {
    await this.settingsService.setSetting(key, value);
    this.toastService.success(this.translationService.translate('settings.updated'));
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
