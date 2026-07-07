import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-videogames-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videogames-add.component.html',
  styleUrls: ['./videogames-add.component.css']
})
export class VideogamesAddComponent {
  game: any = {};
  private gameService = inject(GameService);

  constructor() {}

  /**
   * Guarda un nuevo videojuego llamando al servicio local.
   */
  async addVideogame() {
    const { calificacion, ...gameData } = this.game;
    await this.gameService.addGame(gameData);
    this.game = {};
    alert('Videojuego agregado con éxito');
  }
}
