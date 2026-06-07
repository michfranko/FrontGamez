import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-videogames-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videogames-add.component.html',
  styleUrls: ['./videogames-add.component.css']
})
export class VideogamesAddComponent {
  game: any = {};
  private firestore = inject(Firestore);
  constructor() {}
  async addVideogame() {
    // No guardar calificacion aquí
    const { calificacion, ...gameData } = this.game;
    const ref = collection(this.firestore, 'videogames');
    await addDoc(ref, gameData);
    this.game = {};
    alert('Videojuego agregado');
  }
}
