import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, getDoc } from '@angular/fire/firestore';
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

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    const ref = collection(this.firestore, 'videogames');
    collectionData(ref, { idField: 'id' }).subscribe(async (games: any[]) => {
      const reviewsArr = [];
      for (const game of games) {
        const reviewRef = doc(this.firestore, `videogames/${game.id}/review/data`);
        const reviewSnap = await getDoc(reviewRef);
        if (reviewSnap.exists()) {
          const data = reviewSnap.data();
          reviewsArr.push({ nombre: game.nombre, calificacion: data['calificacion'], texto: data['texto'] });
        }
      }
      this.reviews = reviewsArr;
      this.filterReviews();
    });
  }

  filterReviews() {
    const term = this.searchTerm.toLowerCase();
    this.filteredReviews = this.reviews.filter(r => r.nombre.toLowerCase().includes(term));
  }
}
