import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-state-container">
      <div class="spinner"></div>
      <p class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      gap: 1rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(168, 85, 247, 0.2);
      border-top-color: #a855f7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-message {
      font-size: 0.9rem;
      color: #94a3b8;
      font-weight: 500;
    }
  `]
})
export class LoadingStateComponent {
  @Input() message: string = 'Cargando contenido...';
}
