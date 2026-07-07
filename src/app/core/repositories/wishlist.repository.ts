import { Injectable } from '@angular/core';
import { DatabaseManager } from '../database/database.manager';
import { WishlistItem } from '../../models/entities/wishlist.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistRepository {
  constructor(private db: DatabaseManager) {}

  /**
   * Obtiene todos los artículos de la lista de deseos.
   */
  async getAll(): Promise<WishlistItem[]> {
    const rows = await this.db.query('SELECT * FROM wishlist');
    return rows.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      plataforma: row.plataforma,
      prioridad: row.prioridad,
      notas: row.notas,
      fechaAgregado: row.fechaAgregado
    }));
  }

  /**
   * Inserta un nuevo artículo en la lista de deseos.
   */
  async create(item: WishlistItem): Promise<void> {
    const sql = `
      INSERT INTO wishlist (id, nombre, plataforma, prioridad, notas, fechaAgregado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await this.db.execute(sql, [item.id, item.nombre, item.plataforma, item.prioridad, item.notas, item.fechaAgregado]);
  }

  /**
   * Elimina un artículo de la lista de deseos.
   */
  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM wishlist WHERE id = ?', [id]);
  }
}
