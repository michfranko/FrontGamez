import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/entities/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-card" (click)="onCardClick()">
      <div class="card-header">
        <div class="game-icon-badge">
          <span class="material-symbols-outlined">sports_esports</span>
        </div>

        <button
          type="button"
          class="favorite-btn"
          [class.is-favorite]="game.favorito"
          (click)="onFavoriteClick($event)"
          title="Favorito"
        >
          <span class="material-symbols-outlined fav-icon">{{ game.favorito ? 'favorite' : 'favorite_border' }}</span>
        </button>

        <div class="status-badge" [ngClass]="(game.estado || 'pendiente').toLowerCase()">
          <span class="status-dot"></span>
          <span>{{ getStatusLabel(game.estado) }}</span>
        </div>
      </div>

      <div class="card-content">
        <h3 class="game-title" [title]="game.nombre">{{ game.nombre }}</h3>
        <div class="game-meta">
          <span class="platform-tag">{{ game.plataforma || 'N/A' }}</span>
          <span *ngIf="game.tipo" class="genre-tag">{{ game.tipo }}</span>
        </div>

        <div class="card-footer">
          <div class="rating-display" *ngIf="game.calificacion !== null && game.calificacion !== undefined">
            <span class="material-symbols-outlined star-icon">star</span>
            <span class="rating-val">{{ game.calificacion }}</span>
          </div>
          <div class="rating-display unrated" *ngIf="game.calificacion === null || game.calificacion === undefined">
            <span class="unrated-text">Sin calificar</span>
          </div>

          <span class="version-badge" *ngIf="game.version">{{ game.version | titlecase }}</span>
        </div>
      </div>
    </div>
  `,

  styles: [`
    .game-card {
      background: var(--bg-card, rgba(30, 27, 75, 0.4));
      border: 1px solid var(--border-color, rgba(168, 85, 247, 0.15));
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      position: relative;
    }
    .game-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-color-hover, rgba(168, 85, 247, 0.4));
      box-shadow: var(--card-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.5));
    }
    .card-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 88px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(15, 23, 42, 0.9));
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .game-icon-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: var(--primary, #a855f7);
    }
    .game-icon-badge .material-symbols-outlined {
      font-size: 2rem;
    }
    .favorite-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
      color: #94a3b8;
      transition: transform 0.2s ease, background 0.2s ease;
      z-index: 2;
    }
    .favorite-btn:hover {
      transform: scale(1.15);
      background: rgba(15, 23, 42, 0.9);
      color: #ef4444;
    }
    .favorite-btn.is-favorite {
      color: #ef4444;
    }
    .fav-icon {
      font-size: 1.1rem;
    }
    .status-badge {
      position: absolute;
      bottom: 8px;
      left: 8px;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      backdrop-filter: blur(6px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .status-badge.pendiente {
      background: rgba(234, 179, 8, 0.9);
      color: #000;
    }
    .status-badge.pendiente .status-dot { background: #000; }

    .status-badge.jugando {
      background: rgba(59, 130, 246, 0.9);
      color: #fff;
    }
    .status-badge.jugando .status-dot { background: #60a5fa; }

    .status-badge.terminado {
      background: rgba(34, 197, 94, 0.9);
      color: #fff;
    }
    .status-badge.terminado .status-dot { background: #4ade80; }

    .card-content {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
    }
    .game-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary, #f8fafc);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .game-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .platform-tag {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--secondary, #38bdf8);
      background: rgba(56, 189, 248, 0.12);

      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
    .genre-tag {
      font-size: 0.7rem;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 0.4rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .rating-display {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #facc15;
    }
    .unrated-text {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 400;
    }
    .version-badge {
      font-size: 0.65rem;
      text-transform: uppercase;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }
  `]
})
export class GameCardComponent {
  @Input() game!: Game;
  @Output() cardClick = new EventEmitter<Game>();
  @Output() toggleFavorite = new EventEmitter<Game>();

  imageFailed = false;

  onImageError(event: Event) {
    this.imageFailed = true;
  }

  onCardClick() {
    this.cardClick.emit(this.game);
  }

  onFavoriteClick(event: Event) {
    event.stopPropagation();
    this.toggleFavorite.emit(this.game);
  }

  getStatusLabel(status: string): string {
    const s = (status || 'pendiente').toLowerCase();
    if (s === 'terminado') return 'Terminado';
    if (s === 'jugando') return 'Jugando';
    return 'Pendiente';
  }
}
