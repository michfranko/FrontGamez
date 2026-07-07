import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsMenuComponent } from './reviews-menu.component';
import { ReviewService } from '../core/services/review.service';

@Component({
  selector: 'app-review-read',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewsMenuComponent],
  templateUrl: './review-read.component.html',
  styleUrls: ['./review-read.component.css']
})
export class ReviewReadComponent implements OnInit {
  reviews: any[] = [];
  filteredReviews: any[] = [];
  searchTerm: string = '';
  editReviewId: string | null = null;
  editReview: any = { calificacion: '', texto: '' };

  private reviewService = inject(ReviewService);

  constructor() {}

  ngOnInit() {
    // Suscribirse de manera reactiva a los cambios en las reseñas
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

  /**
   * Filtra las reseñas por el término de búsqueda.
   */
  filterReviews() {
    const term = this.searchTerm.toLowerCase();
    this.filteredReviews = this.reviews.filter(r => r.nombre.toLowerCase().includes(term));
  }

  startEdit(review: any) {
    this.editReviewId = review.id;
    this.editReview = { calificacion: review.calificacion, texto: review.texto };
  }

  cancelEdit() {
    this.editReviewId = null;
    this.editReview = { calificacion: '', texto: '' };
  }

  /**
   * Guarda la reseña editada a través del servicio local de negocio.
   */
  async saveEdit() {
    if (!this.editReviewId) return;
    
    await this.reviewService.saveReview(
      this.editReviewId,
      this.editReview.calificacion,
      this.editReview.texto
    );
    
    this.cancelEdit();
  }
}
