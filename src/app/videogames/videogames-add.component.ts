import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../core/services/game.service';
import { ToastService } from '../core/services/toast.service';
import { GenreSelectorComponent } from '../shared/components/genre-selector.component';
import { PlatformSelectorComponent } from '../shared/components/platform-selector.component';
import { StatusSelectorComponent } from '../shared/components/status-selector.component';

@Component({
  selector: 'app-videogames-add',
  standalone: true,
  imports: [CommonModule, FormsModule, GenreSelectorComponent, PlatformSelectorComponent, StatusSelectorComponent],
  templateUrl: './videogames-add.component.html',
  styleUrls: ['./videogames-add.component.css']
})
export class VideogamesAddComponent {
  @Input() isModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() gameAdded = new EventEmitter<void>();

  duplicateWarning: string | null = null;

  game: any = {
    gameId: '',
    nombre: '',
    tipo: '',
    genres: [] as string[],
    estado: 'pendiente',
    version: 'digital',
    plataforma: 'PC',
    prioridad: 'media',
    fechaIncorporacion: new Date().toISOString().split('T')[0],
    fechaFinalizacion: null,
    anioLanzamiento: new Date().getFullYear(),
    calificacion: null
  };

  private gameService = inject(GameService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  checkDuplicate() {
    if (!this.game.nombre || !this.game.plataforma) {
      this.duplicateWarning = null;
      return;
    }
    const dup = this.gameService.checkDuplicate(this.game.nombre, this.game.plataforma);
    if (dup) {
      this.duplicateWarning = `Ya tienes "${this.game.nombre}" en la plataforma ${this.game.plataforma} en tu colección.`;
    } else {
      this.duplicateWarning = null;
    }
  }

  onPlatformChange(plat: string) {
    this.game.plataforma = plat;
    this.checkDuplicate();
  }

  onGenreChange(genres: string[]) {
    this.game.genres = genres;
    this.game.tipo = genres.join(' / ');
  }

  async saveGame() {
    if (!this.game.nombre || !this.game.plataforma) {
      this.toastService.showError('Por favor completa el nombre y la plataforma.');
      return;
    }

    await this.gameService.addGame(this.game);
    this.toastService.showSuccess(`"${this.game.nombre}" agregado con éxito`);

    this.gameAdded.emit();
    if (this.isModal) {
      this.closeModal.emit();
    } else {
      this.router.navigate(['/library']);
    }
  }

  onClose() {
    this.closeModal.emit();
  }
}
