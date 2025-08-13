import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collectionData, collection, doc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { VideogamesEditComponent } from './videogames-edit.component';
import { VideogamesDeleteComponent } from './videogames-delete.component';

@Component({
  selector: 'app-videogames-list',
  standalone: true,
  imports: [CommonModule, FormsModule, VideogamesEditComponent, VideogamesDeleteComponent],
  templateUrl: './videogames-list.component.html',
  styleUrls: ['./videogames-list.component.css', './videogames-list.layout.css', './videogames-list.searchbar.css']
})
export class VideogamesListComponent {
  videogames$: Observable<any[]>;
  allGames: any[] = [];
  filteredGames: any[] = [];
  searchTerm: string = '';
  sortOption: string = '';
  selectedGame: any = null;
  reviewsMap: { [gameId: string]: any } = {};

  constructor(private firestore: Firestore) {
    const ref = collection(firestore, 'videogames');
    this.videogames$ = collectionData(ref, { idField: 'id' });
    this.videogames$.subscribe(games => {
      this.allGames = games;
      this.loadReviews();
    });
  }

  async loadReviews() {
    // Cargar reseñas para todos los juegos en paralelo
    const reviewsMap: { [gameId: string]: any } = {};
    await Promise.all(this.allGames.map(async (game) => {
      const reviewRef = doc(this.firestore, `videogames/${game.id}/review/data`);
      const reviewSnap = await getDoc(reviewRef);
      if (reviewSnap.exists()) {
        reviewsMap[game.id] = reviewSnap.data();
      }
    }));
    this.reviewsMap = reviewsMap;
    this.filterGames();
  }

  filterGames() {
    let games = [...this.allGames];
    // Filtro por nombre
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      games = games.filter(g => g.nombre?.toLowerCase().includes(term));
    }
    // Orden y filtros
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

  getCalificacion(game: any): number | null {
    const review = this.reviewsMap[game.id];
    if (review && review.calificacion) {
      return Number(review.calificacion);
    }
    return null;
  }

  selectGame(game: any) {
    this.selectedGame = { ...game };
  }
  clearSelection() {
    this.selectedGame = null;
  }
}
