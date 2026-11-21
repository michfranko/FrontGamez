import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GameService } from '../core/services/game.service';
import { ReviewService } from '../core/services/review.service';
import { ToastService } from '../core/services/toast.service';
import { Game } from '../models/entities/game.model';
import { StatusSelectorComponent } from '../shared/components/status-selector.component';
import { VideogamesEditComponent } from '../videogames/videogames-edit.component';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusSelectorComponent, VideogamesEditComponent],
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.css']
})
export class GameDetailComponent implements OnInit {
  game: Game | null = null;
  gameId: string = '';
  loading = true;
  editing = false;

  // Reseña personal
  reviewText: string = '';
  reviewRating: number = 9.0;
  existingReview: any = null;
  savingReview = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private reviewService = inject(ReviewService);
  private toast = inject(ToastService);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = params['id'];
      if (this.gameId) {
        this.loadGame();
      }
    });
  }

  async loadGame() {
    this.loading = true;
    const g = this.gameService.getGameByIdFromState(this.gameId);
    if (g) {
      this.game = { ...g };
    } else {
      // Intento recargar desde base de datos
      await this.gameService.refresh();
      this.game = this.gameService.getGameByIdFromState(this.gameId) || null;
    }

    if (this.game) {
      const review = await this.reviewService.getReviewForGame(this.game.id);
      if (review) {
        this.existingReview = review;
        this.reviewText = review.texto || '';
        this.reviewRating = Number(review.calificacion) || 9.0;
      }
    }
    this.loading = false;
  }

  async onStatusChange(newStatus: string) {
    if (!this.game) return;
    const isTerminado = newStatus === 'terminado';
    const fechaFin = isTerminado ? new Date().toISOString().split('T')[0] : null;

    this.game.estado = newStatus;
    this.game.fechaFinalizacion = fechaFin;
    await this.gameService.updateGame(this.game);
    this.toast.showSuccess(`Estado actualizado a "${newStatus}"`);
  }

  async toggleFavorite() {
    if (!this.game) return;
    this.game.favorito = !this.game.favorito;
    await this.gameService.updateGame(this.game);
    this.toast.showSuccess(this.game.favorito ? 'Añadido a favoritos' : 'Eliminado de favoritos');
  }

  async saveReview() {
    if (!this.game) return;
    this.savingReview = true;
    try {
      await this.reviewService.saveReview({
        game_id: this.game.id,
        calificacion: this.reviewRating,
        texto: this.reviewText
      });
      // Actualizar también la calificación del juego
      this.game.calificacion = this.reviewRating;
      await this.gameService.updateGame(this.game);
      this.toast.showSuccess('Reseña guardada con éxito');
    } catch (err) {
      this.toast.showError('Error al guardar la reseña');
    } finally {
      this.savingReview = false;
    }
  }

  async deleteGame() {
    if (!this.game) return;
    if (confirm(`¿Estás seguro de que deseas eliminar "${this.game.nombre}" de tu colección?`)) {
      await this.gameService.deleteGame(this.game.id);
      this.toast.showSuccess('Juego eliminado de tu biblioteca');
      this.router.navigate(['/library']);
    }
  }

  openEdit() {
    this.editing = true;
  }

  closeEdit() {
    this.editing = false;
    this.loadGame();
  }

  goBack() {
    this.router.navigate(['/library']);
  }
}
