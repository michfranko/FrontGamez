import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GameService } from './core/services/game.service';
import { RecommendationService } from './core/services/recommendation.service';
import { Game } from './models/entities/game.model';
import { GameCardComponent } from './shared/components/game-card.component';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, GameCardComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  games: Game[] = [];

  // Resumen Colección
  totalGames = 0;
  completedCount = 0;
  playingCount = 0;
  pendingCount = 0;

  // Jugando ahora
  playingGames: Game[] = [];

  // Sugerencia destacada
  suggestedGame: Game | null = null;
  ignoredSuggestionIds: string[] = [];

  // Juegos mejor calificados
  topRatedGames: Game[] = [];

  private gameService = inject(GameService);
  private recommendationService = inject(RecommendationService);
  private router = inject(Router);
  private toast = inject(ToastService);

  ngOnInit() {
    this.gameService.games$.subscribe((games: Game[]) => {
      this.games = games;
      this.calculateStats();
      this.updateRecommendation();
    });
  }

  calculateStats() {
    this.totalGames = this.games.length;
    this.completedCount = this.games.filter(g => (g.estado || '').toLowerCase() === 'terminado').length;
    this.playingCount = this.games.filter(g => (g.estado || '').toLowerCase() === 'jugando').length;
    this.pendingCount = this.games.filter(g => (g.estado || '').toLowerCase() === 'pendiente').length;

    this.playingGames = this.games.filter(g => (g.estado || '').toLowerCase() === 'jugando');
    this.topRatedGames = this.recommendationService.getTopRatedGames(this.games, 5);
  }

  updateRecommendation() {
    this.suggestedGame = this.recommendationService.getRecommendation(
      this.games,
      this.ignoredSuggestionIds
    );
  }

  chooseAnotherSuggestion() {
    if (this.suggestedGame) {
      this.ignoredSuggestionIds.push(this.suggestedGame.id);
    }
    this.updateRecommendation();
  }

  async startPlayingSuggested() {
    if (!this.suggestedGame) return;
    this.suggestedGame.estado = 'jugando';
    await this.gameService.updateGame(this.suggestedGame);
    this.toast.showSuccess(`¡A jugar! "${this.suggestedGame.nombre}" pasa a estado Jugando.`);
    this.router.navigate(['/game', this.suggestedGame.id]);
  }

  onGameClick(game: Game) {
    this.router.navigate(['/game', game.id]);
  }
}
