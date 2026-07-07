import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { VideogamesEditComponent } from './videogames-edit.component';
import { VideogamesDeleteComponent } from './videogames-delete.component';
import { GameService } from '../core/services/game.service';
import { ReviewService } from '../core/services/review.service';
import { Game } from '../models/entities/game.model';

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
  selectedGame: Game | null = null;
  reviewsMap: { [gameId: string]: any } = {};

  private gameService = inject(GameService);
  private reviewService = inject(ReviewService);

  constructor() {
    this.videogames$ = this.gameService.games$;
    this.videogames$.subscribe(games => {
      this.allGames = games;
      this.loadReviews();
    });
  }

  /**
   * Carga las reseñas en memoria local para mapear calificaciones en el listado.
   */
  async loadReviews() {
    const reviewsMap: { [gameId: string]: any } = {};
    
    // Obtener las reseñas en paralelo desde el repositorio local
    await Promise.all(this.allGames.map(async (game) => {
      const review = await this.reviewService.getReviewForGame(game.id);
      if (review) {
        reviewsMap[game.id] = review;
      }
    }));
    
    this.reviewsMap = reviewsMap;
    this.filterGames();
  }

  /**
   * Aplica filtros y ordenamiento en memoria al listado de juegos.
   */
  filterGames() {
    let games = [...this.allGames];
    
    // Filtro por nombre
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      games = games.filter(g => g.nombre?.toLowerCase().includes(term));
    }
    
    // Orden y filtros de estado/versión
    switch (this.sortOption) {
      case 'calificacion-desc':
        games = games.sort((a, b) => (this.getCalificacion(b) ?? 0) - (this.getCalificacion(a) ?? 0));
        break;
      case 'calificacion-asc':
        games = games.sort((a, b) => (this.getCalificacion(a) ?? 0) - (this.getCalificacion(b) ?? 0));
        break;
      case 'estado-terminado':
        games = games.filter(g => g.estado === 'terminado');
        break;
      case 'estado-jugando':
        games = games.filter(g => g.estado === 'jugando');
        break;
      case 'estado-pendiente':
        games = games.filter(g => g.estado === 'pendiente');
        break;
      case 'version-digital':
        games = games.filter(g => g.version === 'digital');
        break;
      case 'version-fisico':
        games = games.filter(g => g.version === 'fisico');
        break;
    }
    this.filteredGames = games;
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
