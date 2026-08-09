import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../core/services/game.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-videogames-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videogames-delete.component.html',
  styleUrls: ['./videogames-delete.component.css']
})
export class VideogamesDeleteComponent {
  @Input() id: string = '';
  @Output() deleted = new EventEmitter<void>();

  private gameService = inject(GameService);
  private toastService = inject(ToastService);

  constructor() {}

  /**
   * Elimina el videojuego seleccionado (SQLite eliminará en cascada la reseña).
   */
  async deleteVideogame() {
    if (!this.id) return;
    await this.gameService.deleteGame(this.id);
    this.toastService.info('Videojuego y reseña eliminados');
    this.deleted.emit();
  }

  confirmDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar este videojuego?')) {
      this.deleteVideogame();
    }
  }
}
