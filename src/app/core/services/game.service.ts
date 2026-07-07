import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game } from '../../models/entities/game.model';
import { GameRepository } from '../repositories/game.repository';
import { generateUUID } from '../../shared/helpers/uuid.helper';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gamesSubject = new BehaviorSubject<Game[]>([]);
  games$: Observable<Game[]> = this.gamesSubject.asObservable();

  constructor(
    private gameRepo: GameRepository,
    private logger: LoggerService
  ) {
    this.refresh();
  }

  /**
   * Recarga el listado de videojuegos desde la base de datos y emite la actualización.
   */
  async refresh(): Promise<void> {
    try {
      this.logger.info('Refrescando el listado de juegos en memoria...');
      const games = await this.gameRepo.getAll();
      this.gamesSubject.next(games);
    } catch (err) {
      this.logger.error('Error al refrescar listado de juegos', err);
    }
  }

  /**
   * Agrega un nuevo videojuego generando un UUID y recargando el estado.
   */
  async addGame(gameData: Omit<Game, 'id' | 'calificacion' | 'coverPath' | 'bannerPath'>): Promise<string> {
    const id = generateUUID();
    const newGame: Game = {
      ...gameData,
      id,
      calificacion: null,
      coverPath: null,
      bannerPath: null
    };

    this.logger.info(`Agregando nuevo videojuego: ${newGame.nombre} con ID: ${id}`);
    await this.gameRepo.create(newGame);
    await this.refresh();
    return id;
  }

  /**
   * Actualiza los datos de un videojuego.
   */
  async updateGame(game: Game): Promise<void> {
    this.logger.info(`Actualizando videojuego ID: ${game.id} (${game.nombre})`);
    await this.gameRepo.update(game);
    await this.refresh();
  }

  /**
   * Elimina un videojuego (los triggers de base de datos se encargan de borrar las reseñas asociadas).
   */
  async deleteGame(id: string): Promise<void> {
    this.logger.info(`Eliminando videojuego ID: ${id}`);
    await this.gameRepo.delete(id);
    await this.refresh();
  }

  /**
   * Obtiene un videojuego específico de la memoria actual.
   */
  getGameByIdFromState(id: string): Game | undefined {
    return this.gamesSubject.value.find(g => g.id === id);
  }
}
