import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatusOption {
  value: 'pendiente' | 'jugando' | 'terminado';
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-status-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-selector">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <div class="status-buttons">
        <button
          type="button"
          *ngFor="let opt of options"
          class="status-btn"
          [class.selected]="selectedStatus === opt.value"
          [ngClass]="opt.colorClass"
          (click)="selectStatus(opt.value)"
        >
          <span class="material-symbols-outlined status-icon">{{ opt.icon }}</span>
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .status-selector {
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
    .status-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .status-btn {
      flex: 1 1 0;
      min-width: 0;
      padding: 0.5rem 0.35rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 500;
      background: var(--bg-surface-solid, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      color: var(--text-secondary, #94a3b8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }
    .status-btn span:last-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .status-icon {
      font-size: 1.1rem;
    }
    .status-btn:hover {
      background: var(--bg-surface-hover, rgba(255, 255, 255, 0.08));
      color: var(--text-primary, #fff);
    }
    .status-btn.selected.pendiente {
      background: rgba(234, 179, 8, 0.15);
      border-color: #eab308;
      color: var(--text-primary, #fef08a);
      font-weight: 600;
    }
    .status-btn.selected.jugando {
      background: rgba(59, 130, 246, 0.15);
      border-color: #3b82f6;
      color: var(--text-primary, #93c5fd);
      font-weight: 600;
    }
    .status-btn.selected.terminado {
      background: rgba(34, 197, 94, 0.15);
      border-color: #22c55e;
      color: var(--text-primary, #86efac);
      font-weight: 600;
    }
  `]
})
export class StatusSelectorComponent {
  @Input() label: string = 'Estado';
  @Input() selectedStatus: string = 'pendiente';
  @Output() selectedStatusChange = new EventEmitter<string>();

  options: StatusOption[] = [
    { value: 'pendiente', label: 'Pendiente', icon: 'schedule', colorClass: 'pendiente' },
    { value: 'jugando', label: 'Jugando', icon: 'play_circle', colorClass: 'jugando' },
    { value: 'terminado', label: 'Terminado', icon: 'check_circle', colorClass: 'terminado' }
  ];


  selectStatus(status: string) {
    this.selectedStatus = status;
    this.selectedStatusChange.emit(status);
  }
}
