import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReviewService } from '../core/services/review.service';
import { ToastService } from '../core/services/toast.service';
import { EmptyStateComponent } from '../shared/components/empty-state.component';

@Component({
  selector: 'app-review-read',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent],
  templateUrl: './review-read.component.html',
  styleUrls: ['./review-read.component.css']
})
export class ReviewReadComponent implements OnInit {
  reviews: any[] = [];
  filteredReviews: any[] = [];
  searchTerm: string = '';
  editReviewId: string | null = null;
  editReview: any = { calificacion: 9.0, texto: '' };

  private reviewService = inject(ReviewService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  ngOnInit() {
    this.reviewService.reviews$.subscribe((reviewsList) => {
      this.reviews = reviewsList.map(r => ({
        id: r.game_id,
        nombre: r.gameNombre,
        calificacion: r.calificacion,
        texto: r.texto
      })).sort((a, b) => Number(b.calificacion) - Number(a.calificacion));

      this.filterReviews();
    });
  }

  filterReviews() {
    const term = this.searchTerm.toLowerCase();
    this.filteredReviews = this.reviews.filter(r => (r.nombre || '').toLowerCase().includes(term));
  }

  goToGameDetail(gameId: string) {
    this.router.navigate(['/game', gameId]);
  }

  startEdit(review: any) {
    this.editReviewId = review.id;
    this.editReview = { calificacion: Number(review.calificacion), texto: review.texto };
  }

  cancelEdit() {
    this.editReviewId = null;
    this.editReview = { calificacion: 9.0, texto: '' };
  }

  async saveEdit() {
    if (!this.editReviewId) return;

    await this.reviewService.saveReview({
      game_id: this.editReviewId,
      calificacion: this.editReview.calificacion,
      texto: this.editReview.texto
    });

    this.toastService.showSuccess('Reseña actualizada con éxito');
    this.cancelEdit();
  }

  async deleteReview(gameId: string) {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
      await this.reviewService.deleteReview(gameId);
      this.toastService.showSuccess('Reseña eliminada');
    }
  }
}
