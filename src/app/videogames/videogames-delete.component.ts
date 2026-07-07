import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-videogames-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videogames-delete.component.html',
  styleUrls: ['./videogames-delete.component.css']
})
export class VideogamesDeleteComponent {
  @Input() id: string = '';
  private gameService = inject(GameService);

  constructor() {}

  /**
   * Elimina el videojuego seleccionado (SQLite eliminará en cascada la reseña).
   */
  async deleteVideogame() {
    if (!this.id) return;
    await this.gameService.deleteGame(this.id);
    alert('Videojuego y reseña eliminados');
  }

  confirmDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar este videojuego?')) {
      this.deleteVideogame();
    }
  }
}
