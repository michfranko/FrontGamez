import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../core/services/game.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-videogames-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videogames-add.component.html',
  styleUrls: ['./videogames-add.component.css']
})
export class VideogamesAddComponent {
  game: any = {
    estado: 'pendiente',
    version: 'digital',
    prioridad: 'media'
  };

  private gameService = inject(GameService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  constructor() {}

  /**
   * Guarda un nuevo videojuego llamando al servicio local.
   */
  async addVideogame() {
    if (!this.game.nombre || !this.game.plataforma) return;
    const { calificacion, ...gameData } = this.game;
    await this.gameService.addGame(gameData);
    this.toastService.success(`"${this.game.nombre}" agregado con éxito`);
    this.game = {
      estado: 'pendiente',
      version: 'digital',
      prioridad: 'media'
    };
    this.router.navigate(['/dashboard/videogames/list']);
  }
}
