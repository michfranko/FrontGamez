import {Component, Input, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-videogames-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videogames-delete.component.html',
  styleUrls: ['./videogames-delete.component.css']
})
export class VideogamesDeleteComponent {
  @Input() id: string = '';
  private firestore = inject(Firestore);
  constructor() {}
  async deleteVideogame() {
    if (!this.id) return;
    // Eliminar reseña si existe
    const reviewRef = doc(this.firestore, `videogames/${this.id}/review/data`);
    try {
      await deleteDoc(reviewRef);
    } catch {}
    // Eliminar videojuego
    const ref = doc(this.firestore, `videogames/${this.id}`);
    await deleteDoc(ref);
    alert('Videojuego y reseña eliminados');
  }

  confirmDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar este videojuego?')) {
      this.deleteVideogame();
    }
  }
}
