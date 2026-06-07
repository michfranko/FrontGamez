import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

interface Videogame {
  id?: string;
  nombre?: string;
  tipo?: string;
  estado?: string;
  version?: string;
  plataforma?: string;
  prioridad?: string;
  fechaIncorporacion?: string;
  fechaFinalizacion?: string | null;
  anioLanzamiento?: string | number;
  calificacion?: string | number;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  games: Videogame[] = [];
  totalGames = 0;
  completedCount = 0;
  pendingCount = 0;
  averageRating = 0;
  favoritePlatform = 'N/A';
  favoriteGenre = 'N/A';
  stateMostFrequent = 'N/A';
  top5Games: Videogame[] = [];
  oldestPending: Videogame | null = null;
  pendingOldestDays: number | null = null;
  daysSinceLastCompletion: number | null = null;
  averageByGenre: { genre: string; average: number; count: number }[] = [];
  recommendations: { title: string; value: string }[] = [];
  bestYear = 'N/A';

  private firestore = inject(Firestore);

  ngOnInit() {
    const ref = collection(this.firestore, 'videogames');
    collectionData(ref, { idField: 'id' }).subscribe((games: any[]) => {
      this.games = games;
      this.buildStats();
    });
  }

  buildStats() {
    this.totalGames = this.games.length;
    this.completedCount = this.games.filter((game) => game.estado === 'terminado').length;
    this.pendingCount = this.games.filter((game) => game.estado === 'pendiente').length;
    const ratings = this.games
      .map((game) => Number(game.calificacion))
      .filter((value) => !isNaN(value));
    this.averageRating = ratings.length ? this.round(ratings.reduce((sum, value) => sum + value, 0) / ratings.length, 1) : 0;
    this.favoritePlatform = this.getTopField('plataforma');
    this.favoriteGenre = this.getTopField('tipo');
    this.top5Games = [...this.games]
      .filter((game) => typeof game.calificacion !== 'undefined' && game.calificacion !== null)
      .sort((a, b) => Number(b.calificacion) - Number(a.calificacion))
      .slice(0, 5);
    this.oldestPending = [...this.games]
      .filter((game) => game.estado === 'pendiente')
      .sort((a, b) => (this.parseDate(a.fechaIncorporacion)?.getTime() ?? Infinity) - (this.parseDate(b.fechaIncorporacion)?.getTime() ?? Infinity))[0] || null;
    this.pendingOldestDays = this.oldestPending ? this.daysBetween(this.parseDate(this.oldestPending.fechaIncorporacion) ?? new Date(), new Date()) : null;
    this.stateMostFrequent = this.getTopField('estado');
    this.averageByGenre = this.computeAverageRatingByGenre();
    this.recommendations = this.buildRecommendations();
    const completedDates = this.games
      .filter((game) => game.estado === 'terminado' && game.fechaFinalizacion)
      .map((game) => this.parseDate(game.fechaFinalizacion))
      .filter((date): date is Date => !!date)
      .sort((a, b) => b.getTime() - a.getTime());
    this.daysSinceLastCompletion = completedDates.length ? this.daysBetween(completedDates[0], new Date()) : null;
    this.bestYear = this.computeBestYear();
  }

  getTopField(field: keyof Videogame) {
    const frequency: Record<string, number> = {};
    for (const game of this.games) {
      const value = String(game[field] ?? 'Desconocido').trim();
      if (!value) continue;
      frequency[value] = (frequency[value] ?? 0) + 1;
    }
    const entries = Object.entries(frequency).sort(([, a], [, b]) => b - a);
    return entries.length ? entries[0][0] : 'N/A';
  }

  computeBestYear() {
    const byYear: Record<string, { total: number; count: number }> = {};
    for (const game of this.games) {
      const year = String(game.anioLanzamiento ?? '').trim();
      const rating = Number(game.calificacion);
      if (!year || isNaN(rating)) continue;
      if (!byYear[year]) {
        byYear[year] = { total: 0, count: 0 };
      }
      byYear[year].total += rating;
      byYear[year].count += 1;
    }
    const best = Object.entries(byYear)
      .map(([year, stats]) => ({ year, score: stats.total / stats.count }))
      .sort((a, b) => b.score - a.score)[0];
    return best ? `${best.year} (${this.round(best.score, 1)})` : 'N/A';
  }

  computeAverageRatingByGenre() {
    const byGenre: Record<string, { total: number; count: number }> = {};
    for (const game of this.games) {
      const genre = String(game.tipo ?? 'Desconocido').trim();
      const rating = Number(game.calificacion);
      if (!genre || isNaN(rating)) continue;
      if (!byGenre[genre]) {
        byGenre[genre] = { total: 0, count: 0 };
      }
      byGenre[genre].total += rating;
      byGenre[genre].count += 1;
    }
    return Object.entries(byGenre)
      .map(([genre, stats]) => ({ genre, average: this.round(stats.total / stats.count, 1), count: stats.count }))
      .sort((a, b) => b.average - a.average);
  }

  buildRecommendations() {
    const olderPending = [...this.games].filter((game) => game.estado === 'pendiente');
    const bestPending = [...olderPending]
      .filter((game) => typeof game.calificacion !== 'undefined' && game.calificacion !== null)
      .sort((a, b) => Number(b.calificacion) - Number(a.calificacion))[0] || null;
    const fastestComplete = [...this.games]
      .filter((game) => game.estado === 'terminado' && game.fechaIncorporacion && game.fechaFinalizacion)
      .map((game) => ({
        game,
        days: this.daysBetween(this.parseDate(game.fechaIncorporacion) ?? new Date(), this.parseDate(game.fechaFinalizacion) ?? new Date())
      }))
      .sort((a, b) => a.days - b.days)[0]?.game || null;
    const randomGame = this.games.length ? this.games[Math.floor(Math.random() * this.games.length)] : null;
    return [
      {
        title: 'Pendiente más antiguo',
        value: olderPending.length ? `${olderPending.sort((a, b) => (this.parseDate(a.fechaIncorporacion)?.getTime() ?? Infinity) - (this.parseDate(b.fechaIncorporacion)?.getTime() ?? Infinity))[0].nombre}` : 'No hay pendientes'
      },
      {
        title: 'Mejor pendiente valorado',
        value: bestPending ? `${bestPending.nombre} (${bestPending.calificacion})` : 'No hay pendientes valorados'
      },
      {
        title: 'Más corto de completar',
        value: fastestComplete ? `${fastestComplete.nombre}` : 'No hay completados con fechas'
      },
      {
        title: 'Aleatorio',
        value: randomGame ? `${randomGame.nombre}` : 'Sin juegos'
      }
    ];
  }

  parseDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  daysBetween(from: Date, to: Date) {
    const diff = to.getTime() - from.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }

  getOldestPendingLabel() {
    if (!this.oldestPending) return 'No hay pendientes.';
    return `${this.oldestPending.nombre} (añadido ${this.formatDate(this.oldestPending.fechaIncorporacion)})`;
  }

  formatDate(value?: string | null) {
    const date = this.parseDate(value);
    return date ? date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Desconocido';
  }

  round(value: number, digits: number) {
    return Math.round(value * 10 ** digits) / 10 ** digits;
  }
}
