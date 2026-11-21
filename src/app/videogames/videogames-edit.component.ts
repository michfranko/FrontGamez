import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../core/services/game.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-videogames-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videogames-edit.component.html',
  styleUrls: ['./videogames-edit.component.css']
})
export class VideogamesEditComponent {
  @Input() game: any;
  @Output() saved = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  private gameService = inject(GameService);
  private toastService = inject(ToastService);

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
    this.toastService.success('Videojuego actualizado con éxito');
    this.saved.emit();
    this.closeModal.emit();
  }

  cancelEdit() {
    this.canceled.emit();
    this.closeModal.emit();
  }
}
