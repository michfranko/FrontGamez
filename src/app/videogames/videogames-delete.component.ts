import { Component, Input } from '@angular/core';
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
  constructor(private firestore: Firestore) {}
  async deleteVideogame() {
    if (!this.id) return;
    const ref = doc(this.firestore, `videogames/${this.id}`);
    await deleteDoc(ref);
    alert('Videojuego eliminado');
  }

  confirmDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar este videojuego?')) {
      this.deleteVideogame();
    }
  }
}
