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
  async addGame(gameData: Partial<Game> & { nombre: string; estado: string; plataforma: string; prioridad: string; version: string; fechaIncorporacion: string; anioLanzamiento: string | number }): Promise<string> {
    const id = generateUUID();
    const newGame: Game = {
      id,
      gameId: gameData.gameId || '',
      nombre: gameData.nombre,
      tipo: gameData.tipo || '',
      genres: gameData.genres || [],
      estado: gameData.estado,
      version: gameData.version,
      plataforma: gameData.plataforma,
      prioridad: gameData.prioridad,
      fechaIncorporacion: gameData.fechaIncorporacion,
      fechaFinalizacion: gameData.fechaFinalizacion || null,
      anioLanzamiento: gameData.anioLanzamiento,
      calificacion: gameData.calificacion !== undefined ? gameData.calificacion : null,
      favorito: gameData.favorito || false
    };

    this.logger.info(`Agregando nuevo videojuego: ${newGame.nombre} con ID: ${id}`);
    await this.gameRepo.create(newGame);
    await this.refresh();
    return id;
  }

  /**
   * Verifica si ya existe un juego con el mismo nombre y plataforma en la colección.
   */
  checkDuplicate(nombre: string, plataforma: string): Game | undefined {
    const normName = nombre.trim().toLowerCase();
    const normPlat = plataforma.trim().toLowerCase();
    return this.gamesSubject.value.find(g => 
      g.nombre.trim().toLowerCase() === normName &&
      g.plataforma.trim().toLowerCase() === normPlat
    );
  }

  /**
   * Alterna el estado de favorito de un videojuego.
   */
  async toggleFavorite(id: string): Promise<void> {
    const game = this.getGameByIdFromState(id);
    if (!game) return;
    const updated = { ...game, favorito: !game.favorito };
    await this.updateGame(updated);
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
   * Actualiza varios videojuegos en lote.
   */
  async bulkUpdateGames(games: Game[]): Promise<void> {
    this.logger.info(`Actualizando ${games.length} videojuegos en lote`);
    await Promise.all(games.map((game) => this.gameRepo.update(game)));
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
   * Elimina videojuegos en lote.
   */
  async bulkDeleteGames(ids: string[]): Promise<void> {
    this.logger.info(`Eliminando ${ids.length} videojuegos en lote`);
    await Promise.all(ids.map((id) => this.gameRepo.delete(id)));
    await this.refresh();
  }

  /**
   * Obtiene un videojuego específico de la memoria actual.
   */
  getGameByIdFromState(id: string): Game | undefined {
    return this.gamesSubject.value.find(g => g.id === id);
  }

}
