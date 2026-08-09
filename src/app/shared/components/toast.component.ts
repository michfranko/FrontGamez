import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts$ | async" class="toast-item" [ngClass]="toast.type">
        <span class="material-symbols-outlined toast-icon">
          {{ getIcon(toast.type) }}
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="dismiss(toast.id)">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts$: Observable<ToastMessage[]> = this.toastService.toasts$;

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  dismiss(id: number): void {
    this.toastService.remove(id);
  }
}
