import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Review } from '../../models/entities/review.model';
import { ReviewRepository } from '../repositories/review.repository';
import { GameRepository } from '../repositories/game.repository';
import { GameService } from './game.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSubject = new BehaviorSubject<(Review & { gameNombre: string })[]>([]);
  reviews$: Observable<(Review & { gameNombre: string })[]> = this.reviewsSubject.asObservable();

  constructor(
    private reviewRepo: ReviewRepository,
    private gameRepo: GameRepository,
    private gameService: GameService,
    private logger: LoggerService
  ) {
    this.refresh();
  }

  /**
   * Recarga todas las reseñas de la base de datos y emite la actualización.
   */
  async refresh(): Promise<void> {
    try {
      this.logger.info('Refrescando el listado de reseñas en memoria...');
      const reviews = await this.reviewRepo.getAll();
      this.reviewsSubject.next(reviews);
    } catch (err) {
      this.logger.error('Error al refrescar listado de reseñas', err);
    }
  }

  /**
   * Obtiene la reseña de un videojuego específico.
   */
  async getReviewForGame(gameId: string): Promise<Review | null> {
    return await this.reviewRepo.getByGameId(gameId);
  }

  /**
   * Guarda una reseña y actualiza la calificación en la entidad Game correspondiente.
   */
  async saveReview(gameId: string, calificacion: string | number, texto: string): Promise<void> {
    this.logger.info(`Guardando reseña para juego ID: ${gameId} con calificación: ${calificacion}`);
    
    if (!gameId || !texto) {
      throw new Error('El ID de juego y el texto de la reseña son obligatorios.');
    }

    const review: Review = {
      game_id: gameId,
      calificacion,
      texto
    };

    // 1. Guardar la reseña en la tabla 'reviews'
    await this.reviewRepo.save(review);

    // 2. Obtener el juego para actualizar su calificación principal
    const game = await this.gameRepo.getById(gameId);
    if (game) {
      game.calificacion = calificacion;
      await this.gameRepo.update(game);
    }

    // 3. Refrescar los estados reactivos
    await this.refresh();
    await this.gameService.refresh();
  }

  /**
   * Elimina una reseña y resetea la calificación en el juego asociado.
   */
  async deleteReview(gameId: string): Promise<void> {
    this.logger.info(`Eliminando reseña para juego ID: ${gameId}`);
    
    // 1. Eliminar reseña
    await this.reviewRepo.delete(gameId);

    // 2. Limpiar calificación en el juego
    const game = await this.gameRepo.getById(gameId);
    if (game) {
      game.calificacion = null;
      await this.gameRepo.update(game);
    }

    // 3. Refrescar los estados reactivos
    await this.refresh();
    await this.gameService.refresh();
  }
}
