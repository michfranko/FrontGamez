import { Injectable } from '@angular/core';
import { DatabaseManager } from '../database/database.manager';
import { Game } from '../../models/entities/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameRepository {
  constructor(private db: DatabaseManager) {}

  /**
   * Obtiene todos los videojuegos de la base de datos.
   */
  async getAll(): Promise<Game[]> {
    const rows = await this.db.query('SELECT * FROM games');
    return rows.map((row: any) => this.mapRowToGame(row));
  }

  /**
   * Obtiene un videojuego por su identificador UUID.
   */
  async getById(id: string): Promise<Game | null> {
    const rows = await this.db.query('SELECT * FROM games WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return this.mapRowToGame(rows[0]);
  }

  /**
   * Inserta un nuevo videojuego en la base de datos.
   */
  async create(game: Game): Promise<void> {
    const sql = `
      INSERT INTO games (id, nombre, tipo, estado, version, plataforma, prioridad, fechaIncorporacion, fechaFinalizacion, anioLanzamiento, calificacion, coverPath, bannerPath)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      game.id,
      game.nombre,
      game.tipo,
      game.estado,
      game.version,
      game.plataforma,
      game.prioridad,
      game.fechaIncorporacion,
      game.fechaFinalizacion,
      game.anioLanzamiento,
      game.calificacion,
      game.coverPath,
      game.bannerPath
    ];
    await this.db.execute(sql, params);
  }

  /**
   * Actualiza la información de un videojuego existente.
   */
  async update(game: Game): Promise<void> {
    const sql = `
      UPDATE games
      SET nombre = ?, tipo = ?, estado = ?, version = ?, plataforma = ?, prioridad = ?, fechaIncorporacion = ?, fechaFinalizacion = ?, anioLanzamiento = ?, calificacion = ?, coverPath = ?, bannerPath = ?
      WHERE id = ?
    `;
    const params = [
      game.nombre,
      game.tipo,
      game.estado,
      game.version,
      game.plataforma,
      game.prioridad,
      game.fechaIncorporacion,
      game.fechaFinalizacion,
      game.anioLanzamiento,
      game.calificacion,
      game.coverPath,
      game.bannerPath,
      game.id
    ];
    await this.db.execute(sql, params);
  }

  /**
   * Elimina un videojuego de la base de datos.
   */
  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM games WHERE id = ?', [id]);
  }

  /**
   * Mapea un registro plano de la base de datos SQLite a la entidad Game de TypeScript.
   */
  private mapRowToGame(row: any): Game {
    return {
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo,
      estado: row.estado,
      version: row.version,
      plataforma: row.plataforma,
      prioridad: row.prioridad,
      fechaIncorporacion: row.fechaIncorporacion,
      fechaFinalizacion: row.fechaFinalizacion,
      anioLanzamiento: row.anioLanzamiento,
      calificacion: row.calificacion !== null && row.calificacion !== undefined ? row.calificacion : null,
      coverPath: row.coverPath || null,
      bannerPath: row.bannerPath || null
    };
  }
}
