import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-videogames-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videogames-edit.component.html',
  styleUrls: ['./videogames-edit.component.css']
})
export class VideogamesEditComponent {
  @Input() game: any;
  constructor(private firestore: Firestore) {}
  async editVideogame() {
    if (!this.game?.id) return;
    // No permitir editar calificacion aquí
    const { calificacion, ...gameData } = this.game;
    const ref = doc(this.firestore, `videogames/${this.game.id}`);
    await updateDoc(ref, gameData);
    alert('Videojuego actualizado');
  }

  cancelEdit() {}
}
