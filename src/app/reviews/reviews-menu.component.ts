import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reviews-menu',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="reviews-menu">
      <ul>
        <li>
          <a routerLink="/dashboard/reviews/create" routerLinkActive="active">
            <span class="material-symbols-outlined tab-icon">edit_document</span>
            <span>Crear Reseña</span>
          </a>
        </li>
        <li>
          <a routerLink="/dashboard/reviews/read" routerLinkActive="active">
            <span class="material-symbols-outlined tab-icon">rate_review</span>
            <span>Leer Reseñas</span>
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .reviews-menu {
      margin-bottom: 2rem;
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .reviews-menu ul {
      list-style: none;
      padding: 0.35rem;
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }
    .reviews-menu a {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--border-radius-md);
      transition: var(--transition-smooth);
    }
    .tab-icon {
      font-size: 1.2rem;
    }
    .reviews-menu a:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.03);
    }
    .reviews-menu a.active {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
      color: #fff;
      box-shadow: 0 4px 15px var(--primary-glow);
    }
  `]
})
export class ReviewsMenuComponent {}

