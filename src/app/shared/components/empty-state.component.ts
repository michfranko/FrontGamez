import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-container">
      <div class="empty-icon-wrapper">
        <span class="material-symbols-outlined empty-icon">{{ icon }}</span>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message" *ngIf="message">{{ message }}</p>
      <button *ngIf="actionLabel" type="button" class="btn btn-primary" (click)="onAction()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      background: var(--bg-surface, rgba(30, 27, 75, 0.2));
      border: 1px dashed var(--border-color, rgba(168, 85, 247, 0.2));
      border-radius: 16px;
      margin: 1.5rem 0;
    }
    .empty-icon-wrapper {
      margin-bottom: 0.75rem;
    }
    .empty-icon {
      font-size: 3.2rem;
      color: var(--primary, #a855f7);
    }
    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary, #f8fafc);
      margin-bottom: 0.5rem;
    }
    .empty-message {
      font-size: 0.9rem;
      color: var(--text-secondary, #94a3b8);
      max-width: 400px;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .btn-primary {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: #fff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .btn-primary:hover {
      opacity: 0.9;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'inventory_2';

  @Input() title: string = 'No hay datos disponibles';
  @Input() message?: string;
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();

  onAction() {
    this.action.emit();
  }
}
