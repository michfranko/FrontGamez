import { Injectable } from '@angular/core';
import { Game } from '../../models/entities/game.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  /**
   * Retorna el juego pendiente con mayor puntuación determinista.
   * Si se especifica ignoreIds, excluye de la selección dichos IDs para permitir "Elegir otro".
   */
  getRecommendation(games: Game[], ignoreIds: string[] = []): Game | null {
    const pendingGames = games.filter(g =>
      (g.estado || 'pendiente').toLowerCase() === 'pendiente' &&
      !ignoreIds.includes(g.id)
    );

    if (pendingGames.length === 0) {
      // Fallback si todos los ignorados eran los únicos pendientes
      const allPending = games.filter(g => (g.estado || 'pendiente').toLowerCase() === 'pendiente');
      if (allPending.length === 0) return null;
      return allPending[0];
    }

    // Calcular géneros más frecuentes en juegos terminados o favoritos
    const preferredGenres = this.extractPreferredGenres(games);

    const scored = pendingGames.map(game => {
      let score = 0;

      // 1. Prioridad
      const prio = (game.prioridad || 'media').toLowerCase();
      if (prio === 'alta') score += 30;
      else if (prio === 'media') score += 15;
      else score += 5;

      // 2. Favorito
      if (game.favorito) score += 20;

      // 3. Calificación existente
      if (game.calificacion !== null && game.calificacion !== undefined) {
        score += Number(game.calificacion) * 2;
      }

      // 4. Coincidencia con géneros preferidos del usuario
      if (game.tipo) {
        const gameGenres = game.tipo.split('/').map(s => s.trim().toLowerCase());
        gameGenres.forEach(g => {
          if (preferredGenres.has(g)) {
            score += 10;
          }
        });
      }

      // 5. Antigüedad en biblioteca (los más antiguos que llevan esperando ganan puntos)
      if (game.fechaIncorporacion) {
        const addedDate = new Date(game.fechaIncorporacion);
        if (!isNaN(addedDate.getTime())) {
          const daysOld = Math.floor((Date.now() - addedDate.getTime()) / (1000 * 60 * 60 * 24));
          score += Math.min(daysOld * 0.05, 15); // cap de 15 puntos por antigüedad
        }
      }

      return { game, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0].game;
  }

  /**
   * Obtiene los juegos mejor calificados de la colección.
   */
  getTopRatedGames(games: Game[], limit = 5): Game[] {
    return [...games]
      .filter(g => g.calificacion !== null && g.calificacion !== undefined)
      .sort((a, b) => Number(b.calificacion) - Number(a.calificacion))
      .slice(0, limit);
  }

  private extractPreferredGenres(games: Game[]): Set<string> {
    const set = new Set<string>();
    games
      .filter(g => g.estado === 'terminado' || g.favorito)
      .forEach(g => {
        if (g.tipo) {
          g.tipo.split('/').map(s => s.trim().toLowerCase()).forEach(genre => set.add(genre));
        }
      });
    return set;
  }
}
