import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export const CONTROLLED_GENRES = [
  'Acción',
  'Aventura',
  'RPG',
  'Estrategia',
  'Deportes',
  'Carreras',
  'Simulación',
  'Plataformas',
  'Puzle',
  'Shooter',
  'Terror',
  'Metroidvania',
  'Mundo Abierto',
  'Otro'
];

@Component({
  selector: 'app-genre-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="genre-selector">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <div class="genre-chips">
        <button
          type="button"
          *ngFor="let g of availableGenres"
          class="genre-chip"
          [class.selected]="isSelected(g)"
          (click)="toggleGenre(g)"
        >
          {{ g }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .genre-selector {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .genre-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .genre-chip {
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .genre-chip:hover {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.4);
      color: #fff;
    }
    .genre-chip.selected {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      border-color: #a855f7;
      color: #fff;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
    }
  `]
})
export class GenreSelectorComponent {
  @Input() label: string = 'Géneros';
  @Input() selectedGenres: string[] = [];
  @Input() multiple: boolean = true;
  @Output() selectedGenresChange = new EventEmitter<string[]>();
  @Output() genreStringChange = new EventEmitter<string>();

  availableGenres = CONTROLLED_GENRES;

  isSelected(genre: string): boolean {
    return this.selectedGenres.some(g => g.toLowerCase() === genre.toLowerCase());
  }

  toggleGenre(genre: string) {
    if (this.multiple) {
      if (this.isSelected(genre)) {
        this.selectedGenres = this.selectedGenres.filter(g => g.toLowerCase() !== genre.toLowerCase());
      } else {
        this.selectedGenres = [...this.selectedGenres, genre];
      }
    } else {
      this.selectedGenres = [genre];
    }
    this.selectedGenresChange.emit(this.selectedGenres);
    this.genreStringChange.emit(this.selectedGenres.join(' / '));
  }
}
