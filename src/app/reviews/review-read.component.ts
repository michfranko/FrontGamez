import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { ReviewsMenuComponent } from './reviews-menu.component';

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

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const ref = collection(this.firestore, 'videogames');
    collectionData(ref, { idField: 'id' }).subscribe(async (games: any[]) => {
      const reviewsArr: any[] = [];
      await Promise.all(games.map(async (game: any) => {
        const reviewRef = doc(this.firestore, `videogames/${game.id}/review/data`);
        const reviewSnap = await getDoc(reviewRef);
        if (reviewSnap.exists()) {
          const data = reviewSnap.data();
          reviewsArr.push({ id: game.id, nombre: game.nombre, calificacion: data['calificacion'], texto: data['texto'] });
        }
      }));
      // Ordenar por calificación de mayor a menor
      this.reviews = reviewsArr.sort((a, b) => Number(b.calificacion) - Number(a.calificacion));
      this.filterReviews();
    });
  }

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

  async saveEdit() {
    if (!this.editReviewId) return;
    const reviewRef = doc(this.firestore, `videogames/${this.editReviewId}/review/data`);
    await setDoc(reviewRef, {
      calificacion: this.editReview.calificacion,
      texto: this.editReview.texto
    });
    this.cancelEdit();
    this.ngOnInit();
  }
}
