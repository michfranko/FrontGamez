import { Injectable, inject } from '@angular/core';
import { DatabaseManager } from '../database/database.manager';
import { LoggerService } from './logger.service';

export interface TaxStore {
  key: string;         // clave en settings (ej: 'tax_amazon')
  label: string;       // nombre visible (ej: 'Amazon')
  porcentaje: number;  // valor numérico (ej: 10)
}

export const DEFAULT_TAX_STORES: TaxStore[] = [
  { key: 'tax_amazon',      label: 'Amazon',      porcentaje: 10 },
  { key: 'tax_playstation', label: 'PlayStation',  porcentaje: 15 },
  { key: 'tax_steam',       label: 'Steam',        porcentaje: 15 },
  { key: 'tax_nintendo',    label: 'Nintendo',     porcentaje: 10 },
  { key: 'tax_xbox',        label: 'Xbox',         porcentaje: 10 },
  { key: 'tax_epic',        label: 'Epic Games',   porcentaje: 0  },
  { key: 'tax_otra',        label: 'Otra',         porcentaje: 0  },
];

@Injectable({
  providedIn: 'root'
})
export class PriceCalculatorService {
  private db = inject(DatabaseManager);
  private logger = inject(LoggerService);

  private taxStores: TaxStore[] = [...DEFAULT_TAX_STORES];

  /**
   * Carga los porcentajes de impuesto actuales desde la base de datos SQLite.
   */
  async loadTaxRates(): Promise<void> {
    try {
      const rows = await this.db.query('SELECT key, value FROM settings WHERE key LIKE ?', ['tax_%']);
      for (const row of rows) {
        const store = this.taxStores.find(s => s.key === row.key);
        if (store) {
          store.porcentaje = parseFloat(row.value) || 0;
        }
      }
    } catch (err) {
      this.logger.warn('No se pudieron cargar los impuestos desde SQLite, usando valores por defecto.', err);
    }
  }

  /**
   * Guarda un nuevo porcentaje de impuesto en la base de datos.
   */
  async saveTaxRate(key: string, porcentaje: number): Promise<void> {
    await this.db.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(porcentaje)]);
    const store = this.taxStores.find(s => s.key === key);
    if (store) store.porcentaje = porcentaje;
  }

  /**
   * Retorna la lista de tiendas con sus porcentajes.
   */
  getTaxStores(): TaxStore[] {
    return this.taxStores;
  }

  /**
   * Obtiene el porcentaje de impuesto de una tienda por su label.
   */
  getPorcentajeByLabel(label: string): number {
    const store = this.taxStores.find(s => s.label.toLowerCase() === label.toLowerCase());
    return store ? store.porcentaje : 0;
  }

  /**
   * Calcula el monto de impuesto.
   * montoImpuesto = (precioBase × cantidad) × (porcentajeImpuesto / 100)
   */
  calcularImpuesto(precioBase: number, cantidad: number, porcentaje: number): number {
    const subtotal = precioBase * cantidad;
    return subtotal * (porcentaje / 100);
  }

  /**
   * Calcula el precio final con impuesto incluido.
   * precioFinal = precioBase × cantidad × (1 + porcentajeImpuesto / 100)
   */
  calcularPrecioFinal(precioBase: number, cantidad: number, porcentaje: number): number {
    const subtotal = precioBase * cantidad;
    return subtotal * (1 + porcentaje / 100);
  }

  /**
   * Calcula el resumen completo de una lista de ítems.
   */
  calcularResumenLista(items: { precioBase: number; cantidad: number; porcentajeImpuesto: number; comprado?: boolean }[]): {
    subtotalBase: number;
    totalImpuesto: number;
    totalFinal: number;
    subtotalComprado: number;
  } {
    let subtotalBase = 0;
    let totalImpuesto = 0;
    let totalFinal = 0;
    let subtotalComprado = 0;

    for (const item of items) {
      const base = (item.precioBase || 0) * (item.cantidad || 1);
      const impuesto = this.calcularImpuesto(item.precioBase || 0, item.cantidad || 1, item.porcentajeImpuesto || 0);
      const final_ = base + impuesto;

      subtotalBase += base;
      totalImpuesto += impuesto;
      totalFinal += final_;
      if (item.comprado) subtotalComprado += final_;
    }

    return { subtotalBase, totalImpuesto, totalFinal, subtotalComprado };
  }

  /**
   * Formatea un número como moneda (ej: $30.80)
   */
  formatearMoneda(valor: number, moneda: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: moneda }).format(valor);
  }
}
