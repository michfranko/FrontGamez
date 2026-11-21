import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export const CONTROLLED_PLATFORMS = [
  'PlayStation 5',
  'PlayStation 4',
  'Xbox Series X/S',
  'Xbox One',
  'Nintendo Switch',
  'PC',
  'Android',
  'iOS'
];

@Component({
  selector: 'app-platform-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="platform-selector">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <div class="platform-grid">
        <button
          type="button"
          *ngFor="let p of availablePlatforms"
          class="platform-card"
          [class.selected]="selectedPlatform === p"
          (click)="selectPlatform(p)"
        >
          <span class="platform-name">{{ p }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .platform-selector {
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
    .platform-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
    .platform-card {
      min-width: 0;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    @media (min-width: 560px) {
      .platform-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    .platform-card:hover {
      background: rgba(6, 182, 212, 0.15);
      border-color: rgba(6, 182, 212, 0.4);
      color: #fff;
    }
    .platform-card.selected {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border-color: #06b6d4;
      color: #fff;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
    }
  `]
})
export class PlatformSelectorComponent {
  @Input() label: string = 'Plataforma';
  @Input() selectedPlatform: string = '';
  @Output() selectedPlatformChange = new EventEmitter<string>();

  availablePlatforms = CONTROLLED_PLATFORMS;

  selectPlatform(platform: string) {
    this.selectedPlatform = platform;
    this.selectedPlatformChange.emit(platform);
  }
}
