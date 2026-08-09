import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewsMenuComponent } from './reviews-menu.component';
import { GameService } from '../core/services/game.service';
import { ReviewService } from '../core/services/review.service';
import { ToastService } from '../core/services/toast.service';
import { Game } from '../models/entities/game.model';

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewsMenuComponent],
  templateUrl: './review-create.component.html',
  styleUrls: ['./review-create.component.css']
})
export class ReviewCreateComponent implements OnInit {
  games: Game[] = [];
  selectedGameId: string = '';
  review = { calificacion: '10', texto: '' };

  private gameService = inject(GameService);
  private reviewService = inject(ReviewService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {
    // Escuchar cambios reactivos en los videojuegos
    this.gameService.games$.subscribe(async (games: Game[]) => {
      const filtered: Game[] = [];
      for (const game of games) {
        // Filtrar juegos completados que aún no posean reseña
        if (game.estado !== 'terminado') continue;
        const existingReview = await this.reviewService.getReviewForGame(game.id);
        if (!existingReview) {
          filtered.push(game);
        }
      }
      this.games = filtered;
    });
  }

  updateCharCount() {}

  /**
   * Crea una nueva reseña en SQLite y actualiza el estado local de los juegos.
   */
  async createReview() {
    if (!this.selectedGameId || !this.review.texto || this.review.texto.length > 300) return;
    
    await this.reviewService.saveReview(
      this.selectedGameId,
      this.review.calificacion,
      this.review.texto
    );
    
    this.toastService.success('Reseña guardada con éxito');
    this.selectedGameId = '';
    this.review = { calificacion: '10', texto: '' };
    this.router.navigate(['/dashboard/reviews/read']);
  }
}
