import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { VideogamesEditComponent } from './videogames-edit.component';
import { VideogamesDeleteComponent } from './videogames-delete.component';
import { GameService } from '../core/services/game.service';
import { ReviewService } from '../core/services/review.service';
import { Game } from '../models/entities/game.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-videogames-list',
  standalone: true,
  imports: [CommonModule, FormsModule, VideogamesEditComponent, VideogamesDeleteComponent],
  templateUrl: './videogames-list.component.html',
  styleUrls: ['./videogames-list.component.css', './videogames-list.layout.css', './videogames-list.searchbar.css']
})
export class VideogamesListComponent {
  videogames$: Observable<Game[]>;
  allGames: Game[] = [];
  filteredGames: Game[] = [];
  searchTerm: string = '';
  sortOption: string = '';
  statusFilter: string = '';
  platformFilter: string = '';
  genreFilter: string = '';
  selectedGame: Game | null = null;
  reviewsMap: { [gameId: string]: any } = {};
  platformOptions: string[] = [];
  genreOptions: string[] = [];

  private gameService = inject(GameService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.videogames$ = this.gameService.games$;
    this.videogames$.subscribe(games => {
      this.allGames = games;
      this.refreshFilters();
      this.loadReviews();
    });

    // Aplicar filtros pasados por query params (p. ej. desde el dashboard)
    this.route.queryParams.subscribe(params => {
      const f = params['filter'];
      if (f) {
        this.sortOption = f;
        this.filterGames();
      }
    });
  }

  /**
   * Carga las reseñas en memoria local para mapear calificaciones en el listado.
   */
  async loadReviews() {
    const reviewsMap: { [gameId: string]: any } = {};

    await Promise.all(this.allGames.map(async (game) => {
      const review = await this.reviewService.getReviewForGame(game.id);
      if (review) {
        reviewsMap[game.id] = review;
      }
    }));

    this.reviewsMap = reviewsMap;
    this.filterGames();
  }

  refreshFilters() {
    const platforms = new Set<string>();
    const genres = new Set<string>();

    this.allGames.forEach(game => {
      if (game.plataforma) platforms.add(game.plataforma);
      if (game.tipo) {
        game.tipo.split('/').map(part => part.trim()).forEach(part => {
          if (part) genres.add(part);
        });
      }
    });

    this.platformOptions = Array.from(platforms).sort();
    this.genreOptions = Array.from(genres).sort();
  }

  /**
   * Aplica filtros y ordenamiento en memoria al listado de juegos.
   */
  filterGames() {
    let games = [...this.allGames];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      games = games.filter(g => g.nombre?.toLowerCase().includes(term) || g.tipo?.toLowerCase().includes(term));
    }

    if (this.statusFilter) {
      games = games.filter(g => g.estado === this.statusFilter);
    }

    if (this.platformFilter) {
      games = games.filter(g => g.plataforma === this.platformFilter);
    }

    if (this.genreFilter) {
      games = games.filter(g => g.tipo?.toLowerCase().includes(this.genreFilter.toLowerCase()));
    }

    this.applySort(games);
  }

  private applySort(games: Game[]) {
    switch (this.sortOption) {
      case 'calificacion-desc':
        this.filteredGames = games
          .filter(g => this.getCalificacion(g) !== null)
          .sort((a, b) => (this.getCalificacion(b) ?? 0) - (this.getCalificacion(a) ?? 0));
        break;
      case 'calificacion-asc':
        this.filteredGames = games
          .filter(g => this.getCalificacion(g) !== null)
          .sort((a, b) => (this.getCalificacion(a) ?? 0) - (this.getCalificacion(b) ?? 0));
        break;
      case 'fecha-reciente':
        this.filteredGames = games.sort((a, b) => (b.fechaIncorporacion || '').localeCompare(a.fechaIncorporacion || ''));
        break;
      case 'fecha-antigua':
        this.filteredGames = games.sort((a, b) => (a.fechaIncorporacion || '').localeCompare(b.fechaIncorporacion || ''));
        break;
      default:
        this.filteredGames = games;
        break;
    }
  }

  getNextGameStatus(currentStatus: string): string {
    const order = ['pendiente', 'jugando', 'terminado'];
    const normalized = (currentStatus || 'pendiente').toLowerCase();
    const currentIndex = order.indexOf(normalized);
    const nextIndex = (currentIndex === -1 ? 0 : currentIndex + 1) % order.length;
    return order[nextIndex];
  }

  async cycleGameStatus(game: Game) {
    const nextStatus = this.getNextGameStatus(game.estado);
    await this.gameService.updateGame({ ...game, estado: nextStatus });
  }

  /**
   * Obtiene la calificación numérica de un juego a partir del mapa de reseñas.
   */
  getCalificacion(game: Game): number | null {
    const review = this.reviewsMap[game.id];
    if (review && review.calificacion) {
      return Number(review.calificacion);
    }
    return null;
  }

  selectGame(game: Game) {
    this.selectedGame = { ...game };
  }

  clearSelection() {
    this.selectedGame = null;
  }
}
