import { Injectable } from '@angular/core';
import { DatabaseManager } from '../database/database.manager';
import { Review } from '../../models/entities/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewRepository {
  constructor(private db: DatabaseManager) {}

  /**
   * Obtiene todas las reseñas con el nombre del videojuego asociado mediante un JOIN.
   */
  async getAll(): Promise<(Review & { gameNombre: string })[]> {
    const sql = `
      SELECT r.*, g.nombre as gameNombre
      FROM reviews r
      JOIN games g ON r.game_id = g.id
    `;
    const rows = await this.db.query(sql);
    return rows.map((row: any) => ({
      game_id: row.game_id,
      calificacion: row.calificacion,
      texto: row.texto,
      gameNombre: row.gameNombre
    }));
  }

  /**
   * Obtiene la reseña correspondiente a un videojuego específico.
   */
  async getByGameId(gameId: string): Promise<Review | null> {
    const rows = await this.db.query('SELECT * FROM reviews WHERE game_id = ?', [gameId]);
    if (rows.length === 0) return null;
    return {
      game_id: rows[0].game_id,
      calificacion: rows[0].calificacion,
      texto: rows[0].texto
    };
  }

  /**
   * Guarda o actualiza (INSERT OR REPLACE) una reseña.
   */
  async save(review: Review): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO reviews (game_id, calificacion, texto)
      VALUES (?, ?, ?)
    `;
    await this.db.execute(sql, [review.game_id, review.calificacion, review.texto]);
  }

  /**
   * Elimina una reseña por el identificador del videojuego.
   */
  async delete(gameId: string): Promise<void> {
    await this.db.execute('DELETE FROM reviews WHERE game_id = ?', [gameId]);
  }
}
