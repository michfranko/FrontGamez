export interface SettingItem {
  key: string;
  value: string;
}

export interface AppSettings {
  tema: 'light' | 'dark' | 'system';
  idioma: string;
  formatoFecha: string;
  moneda: string;
}
