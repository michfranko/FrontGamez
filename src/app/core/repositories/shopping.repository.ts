import { Injectable } from '@angular/core';
import { DatabaseManager } from '../database/database.manager';
import { ShoppingList } from '../../models/entities/shopping-list.model';
import { ShoppingItem } from '../../models/entities/shopping-item.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingRepository {
  constructor(private db: DatabaseManager) {}

  /**
   * Obtiene todas las listas de compras.
   */
  async getAllLists(): Promise<ShoppingList[]> {
    const rows = await this.db.query('SELECT * FROM shopping_lists');
    return rows.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      fechaCreacion: row.fechaCreacion
    }));
  }

  /**
   * Obtiene todos los artículos de una lista de compras específica.
   */
  async getItemsByListId(listId: string): Promise<ShoppingItem[]> {
    const rows = await this.db.query('SELECT * FROM shopping_items WHERE list_id = ?', [listId]);
    return rows.map((row: any) => ({
      id: row.id,
      list_id: row.list_id,
      nombre: row.nombre,
      precio: row.precio,
      comprado: row.comprado === 1
    }));
  }

  /**
   * Crea una nueva lista de compras.
   */
  async createList(list: ShoppingList): Promise<void> {
    await this.db.execute(
      'INSERT INTO shopping_lists (id, nombre, fechaCreacion) VALUES (?, ?, ?)',
      [list.id, list.nombre, list.fechaCreacion]
    );
  }

  /**
   * Agrega un artículo a una lista de compras.
   */
  async createItem(item: ShoppingItem): Promise<void> {
    await this.db.execute(
      'INSERT INTO shopping_items (id, list_id, nombre, precio, comprado) VALUES (?, ?, ?, ?, ?)',
      [item.id, item.list_id, item.nombre, item.precio, item.comprado ? 1 : 0]
    );
  }

  /**
   * Actualiza el estado de compra de un artículo.
   */
  async updateItemStatus(itemId: string, comprado: boolean): Promise<void> {
    await this.db.execute(
      'UPDATE shopping_items SET comprado = ? WHERE id = ?',
      [comprado ? 1 : 0, itemId]
    );
  }

  /**
   * Elimina una lista de compras (y sus artículos por ON DELETE CASCADE).
   */
  async deleteList(id: string): Promise<void> {
    await this.db.execute('DELETE FROM shopping_lists WHERE id = ?', [id]);
  }
}
