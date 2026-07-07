import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-videogames-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videogames-edit.component.html',
  styleUrls: ['./videogames-edit.component.css']
})
export class VideogamesEditComponent {
  @Input() game: any;
  private gameService = inject(GameService);

  constructor() {}

  /**
   * Actualiza el videojuego seleccionado utilizando el servicio local.
   */
  async editVideogame() {
    if (!this.game?.id) return;
    const { calificacion, ...gameData } = this.game;
    await this.gameService.updateGame({
      ...this.game,
      ...gameData
    });
    alert('Videojuego actualizado');
  }

  cancelEdit() {}
}
