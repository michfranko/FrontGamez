import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reviews-menu',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="reviews-menu">
      <ul>
        <li><a routerLink="/reviews/create" routerLinkActive="active">Crear reseña</a></li>
        <li><a routerLink="/reviews/read" routerLinkActive="active">Leer reseñas</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .reviews-menu ul { list-style: none; padding: 0; display: flex; gap: 1.5rem; justify-content: center; }
    .reviews-menu a { color: #222; text-decoration: none; font-weight: bold; padding: 0.5rem 1rem; border-radius: 8px; transition: background 0.2s; }
    .reviews-menu a.active, .reviews-menu a:hover { background: #ff4081; color: #fff; }
  `]
})
export class ReviewsMenuComponent {}
