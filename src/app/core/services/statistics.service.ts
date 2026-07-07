import { Injectable } from '@angular/core';
import { Game } from '../../models/entities/game.model';

export interface AppStatistics {
  totalGames: number;
  completedCount: number;
  pendingCount: number;
  averageRating: number;
  favoritePlatform: string;
  favoriteGenre: string;
  stateMostFrequent: string;
  top5Games: Game[];
  oldestPending: Game | null;
  pendingOldestDays: number | null;
  daysSinceLastCompletion: number | null;
  averageByGenre: { genre: string; average: number; count: number }[];
  recommendations: { title: string; value: string }[];
  bestYear: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  /**
   * Calcula el conjunto completo de estadísticas a partir de una lista de videojuegos.
   */
  computeStats(games: Game[]): AppStatistics {
    const totalGames = games.length;
    const completedCount = games.filter((game) => game.estado === 'terminado').length;
    const pendingCount = games.filter((game) => game.estado === 'pendiente').length;

    const ratings = games
      .map((game) => Number(game.calificacion))
      .filter((value) => !isNaN(value) && value > 0);

    const averageRating = ratings.length ? this.round(ratings.reduce((sum, value) => sum + value, 0) / ratings.length, 1) : 0;
    const favoritePlatform = this.getTopField(games, 'plataforma');
    const favoriteGenre = this.getTopField(games, 'tipo');

    const top5Games = [...games]
      .filter((game) => game.calificacion !== undefined && game.calificacion !== null && Number(game.calificacion) > 0)
      .sort((a, b) => Number(b.calificacion) - Number(a.calificacion))
      .slice(0, 5);

    const oldestPending = [...games]
      .filter((game) => game.estado === 'pendiente' && game.fechaIncorporacion)
      .sort((a, b) => (this.parseDate(a.fechaIncorporacion)?.getTime() ?? Infinity) - (this.parseDate(b.fechaIncorporacion)?.getTime() ?? Infinity))[0] || null;
    
    const pendingOldestDays = oldestPending ? this.daysBetween(this.parseDate(oldestPending.fechaIncorporacion) ?? new Date(), new Date()) : null;

    const stateMostFrequent = this.getTopField(games, 'estado');
    const averageByGenre = this.computeAverageRatingByGenre(games);
    const recommendations = this.buildRecommendations(games);

    const completedDates = games
      .filter((game) => game.estado === 'terminado' && game.fechaFinalizacion)
      .map((game) => this.parseDate(game.fechaFinalizacion!))
      .filter((date): date is Date => !!date)
      .sort((a, b) => b.getTime() - a.getTime());

    const daysSinceLastCompletion = completedDates.length ? this.daysBetween(completedDates[0], new Date()) : null;
    const bestYear = this.computeBestYear(games);

    return {
      totalGames,
      completedCount,
      pendingCount,
      averageRating,
      favoritePlatform,
      favoriteGenre,
      stateMostFrequent,
      top5Games,
      oldestPending,
      pendingOldestDays,
      daysSinceLastCompletion,
      averageByGenre,
      recommendations,
      bestYear
    };
  }

  private round(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private getTopField(games: Game[], field: keyof Game): string {
    const frequency: Record<string, number> = {};
    for (const game of games) {
      const value = String(game[field] ?? 'Desconocido').trim();
      if (!value || value === 'Desconocido' || value === 'null') continue;
      frequency[value] = (frequency[value] ?? 0) + 1;
    }
    const entries = Object.entries(frequency).sort(([, a], [, b]) => b - a);
    return entries.length ? entries[0][0] : 'N/A';
  }

  private computeAverageRatingByGenre(games: Game[]): { genre: string; average: number; count: number }[] {
    const genreGroups: Record<string, { total: number; count: number }> = {};
    for (const game of games) {
      const genre = String(game.tipo ?? 'Desconocido').trim();
      const rating = Number(game.calificacion);
      if (!genre || isNaN(rating) || rating <= 0) continue;
      if (!genreGroups[genre]) {
        genreGroups[genre] = { total: 0, count: 0 };
      }
      genreGroups[genre].total += rating;
      genreGroups[genre].count += 1;
    }
    return Object.entries(genreGroups).map(([genre, data]) => ({
      genre,
      average: this.round(data.total / data.count, 1),
      count: data.count
    })).sort((a, b) => b.average - a.average);
  }

  private computeBestYear(games: Game[]): string {
    const byYear: Record<string, { total: number; count: number }> = {};
    for (const game of games) {
      const year = String(game.anioLanzamiento ?? '').trim();
      const rating = Number(game.calificacion);
      if (!year || isNaN(rating) || rating <= 0) continue;
      if (!byYear[year]) {
        byYear[year] = { total: 0, count: 0 };
      }
      byYear[year].total += rating;
      byYear[year].count += 1;
    }
    const entries = Object.entries(byYear)
      .map(([year, data]) => ({ year, average: data.total / data.count }))
      .sort((a, b) => b.average - a.average);
    return entries.length ? entries[0].year : 'N/A';
  }

  private buildRecommendations(games: Game[]): { title: string; value: string }[] {
    const list: { title: string; value: string }[] = [];
    
    // Recomendación por género mejor puntuado
    const byGenre = this.computeAverageRatingByGenre(games);
    if (byGenre.length > 0) {
      list.push({
        title: 'Género recomendado para ti',
        value: `${byGenre[0].genre} (Puntuación promedio de ${byGenre[0].average})`
      });
    }

    // Recomendación de juego pendiente con mayor prioridad
    const priorityOrder = ['alta', 'media', 'baja'];
    const pending = [...games]
      .filter((game) => game.estado === 'pendiente')
      .sort((a, b) => {
        const indexA = priorityOrder.indexOf(a.prioridad || 'baja');
        const indexB = priorityOrder.indexOf(b.prioridad || 'baja');
        if (indexA !== indexB) return indexA - indexB;
        return (this.parseDate(a.fechaIncorporacion)?.getTime() ?? 0) - (this.parseDate(b.fechaIncorporacion)?.getTime() ?? 0);
      });

    if (pending.length > 0) {
      list.push({
        title: 'Juego prioritario sugerido para jugar',
        value: `${pending[0].nombre} (${pending[0].plataforma || 'Sin plataforma'}) - Prioridad ${pending[0].prioridad}`
      });
    }

    return list;
  }
}
