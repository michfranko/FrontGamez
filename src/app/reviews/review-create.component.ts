import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { ReviewsMenuComponent } from './reviews-menu.component';

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewsMenuComponent],
  templateUrl: './review-create.component.html',
  styleUrls: ['./review-create.component.css']
})
export class ReviewCreateComponent implements OnInit {
  games: any[] = [];
  selectedGameId: string = '';
  review = { calificacion: '', texto: '' };

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const ref = collection(this.firestore, 'videogames');
    collectionData(ref, { idField: 'id' }).subscribe(async (games: any[]) => {
      // Solo juegos terminados que NO tengan reseña
      const filtered = [];
      for (const game of games) {
        if (game.estado !== 'terminado') continue;
        const reviewRef = doc(this.firestore, `videogames/${game.id}/review/data`);
        const reviewSnap = await getDoc(reviewRef);
        if (!reviewSnap.exists()) {
          filtered.push(game);
        }
      }
      this.games = filtered;
    });
  }

  updateCharCount() {}

  async createReview() {
    if (!this.selectedGameId || !this.review.texto || this.review.texto.length > 300) return;
    const reviewRef = doc(this.firestore, `videogames/${this.selectedGameId}/review/data`);
    await setDoc(reviewRef, {
      calificacion: this.review.calificacion,
      texto: this.review.texto
    });
    // Actualizar la calificación en el documento principal del juego
    const gameRef = doc(this.firestore, `videogames/${this.selectedGameId}`);
    await setDoc(gameRef, { calificacion: this.review.calificacion }, { merge: true });
    alert('Reseña guardada');
    this.selectedGameId = '';
    this.review = { calificacion: '', texto: '' };
    this.ngOnInit();
  }
}
