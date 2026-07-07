import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './core/services/game.service';
import { StatisticsService } from './core/services/statistics.service';
import { Game } from './models/entities/game.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  games: Game[] = [];
  
  // Propiedades requeridas por la plantilla HTML
  totalGames = 0;
  completedCount = 0;
  pendingCount = 0;
  averageRating = 0;
  favoritePlatform = 'N/A';
  favoriteGenre = 'N/A';
  stateMostFrequent = 'N/A';
  top5Games: Game[] = [];
  oldestPending: Game | null = null;
  pendingOldestDays: number | null = null;
  daysSinceLastCompletion: number | null = null;
  bestYear = 'N/A';

  private gameService = inject(GameService);
  private statisticsService = inject(StatisticsService);

  ngOnInit() {
    // Suscribirse de manera reactiva a los juegos en memoria local
    this.gameService.games$.subscribe((games: Game[]) => {
      this.games = games;
      this.buildStats();
    });
  }

  /**
   * Delega el cálculo de estadísticas al StatisticsService y actualiza las propiedades de la UI.
   */
  buildStats() {
    const stats = this.statisticsService.computeStats(this.games);
    
    this.totalGames = stats.totalGames;
    this.completedCount = stats.completedCount;
    this.pendingCount = stats.pendingCount;
    this.averageRating = stats.averageRating;
    this.favoritePlatform = stats.favoritePlatform;
    this.favoriteGenre = stats.favoriteGenre;
    this.stateMostFrequent = stats.stateMostFrequent;
    this.top5Games = stats.top5Games;
    this.oldestPending = stats.oldestPending;
    this.pendingOldestDays = stats.pendingOldestDays;
    this.daysSinceLastCompletion = stats.daysSinceLastCompletion;
    this.bestYear = stats.bestYear;
  }

  /**
   * Retorna una etiqueta formateada para el videojuego pendiente más antiguo.
   */
  getOldestPendingLabel(): string {
    if (!this.oldestPending) return 'No hay pendientes.';
    return `${this.oldestPending.nombre} (añadido ${this.formatDate(this.oldestPending.fechaIncorporacion)})`;
  }

  /**
   * Helper para formatear fechas en formato localizado en la UI.
   */
  formatDate(value?: string | null): string {
    if (!value) return 'Desconocido';
    const date = new Date(value);
    return isNaN(date.getTime())
      ? 'Desconocido'
      : date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
