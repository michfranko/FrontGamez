import { Injectable } from '@angular/core';
import { DatabaseManager } from '../database/database.manager';
import { ShoppingList } from '../../models/entities/shopping-list.model';
import { ShoppingItem } from '../../models/entities/shopping-item.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingRepository {
  constructor(private db: DatabaseManager) {}

  async getAllLists(): Promise<ShoppingList[]> {
    const rows = await this.db.query('SELECT * FROM shopping_lists ORDER BY fechaCreacion DESC');
    return rows.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      fechaCreacion: row.fechaCreacion,
      presupuesto: parseFloat(row.presupuesto) || 0
    }));
  }

  async getItemsByListId(listId: string): Promise<ShoppingItem[]> {
    const rows = await this.db.query('SELECT * FROM shopping_items WHERE list_id = ?', [listId]);
    return rows.map((row: any) => ({
      id: row.id,
      list_id: row.list_id,
      nombre: row.nombre,
      precioBase: parseFloat(row.precioBase) || 0,
      tienda: row.tienda || '',
      porcentajeImpuesto: parseFloat(row.porcentajeImpuesto) || 0,
      cantidad: parseInt(row.cantidad) || 1,
      comprado: row.comprado === 1,
      seleccionado: row.seleccionado === 1,
      origenWishlist: row.origenWishlist === 1
    }));
  }

  async createList(list: ShoppingList): Promise<void> {
    await this.db.execute(
      'INSERT INTO shopping_lists (id, nombre, fechaCreacion, presupuesto) VALUES (?, ?, ?, ?)',
      [list.id, list.nombre, list.fechaCreacion, list.presupuesto ?? 0]
    );
  }

  async createItem(item: ShoppingItem): Promise<void> {
    await this.db.execute(
      `INSERT INTO shopping_items
        (id, list_id, nombre, precioBase, tienda, porcentajeImpuesto, cantidad, comprado, seleccionado, origenWishlist)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.list_id,
        item.nombre,
        item.precioBase,
        item.tienda,
        item.porcentajeImpuesto,
        item.cantidad,
        item.comprado ? 1 : 0,
        item.seleccionado ? 1 : 0,
        item.origenWishlist ? 1 : 0
      ]
    );
  }

  async updateItemStatus(itemId: string, comprado: boolean, seleccionado?: boolean): Promise<void> {
    const nextSeleccionado = seleccionado ?? false;
    await this.db.execute(
      'UPDATE shopping_items SET comprado = ?, seleccionado = ? WHERE id = ?',
      [comprado ? 1 : 0, nextSeleccionado ? 1 : 0, itemId]
    );
  }

  async updateItemSelection(itemId: string, seleccionado: boolean): Promise<void> {
    await this.db.execute(
      'UPDATE shopping_items SET seleccionado = ? WHERE id = ?',
      [seleccionado ? 1 : 0, itemId]
    );
  }

  async updateListBudget(listId: string, presupuesto: number): Promise<void> {
    await this.db.execute(
      'UPDATE shopping_lists SET presupuesto = ? WHERE id = ?',
      [presupuesto, listId]
    );
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.db.execute('DELETE FROM shopping_items WHERE id = ?', [itemId]);
  }

  async deleteList(id: string): Promise<void> {
    await this.db.execute('DELETE FROM shopping_lists WHERE id = ?', [id]);
  }
}
