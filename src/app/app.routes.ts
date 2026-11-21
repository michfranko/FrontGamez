import { Routes } from '@angular/router';

import { WelcomeComponent } from './welcome.component';
import { DashboardHomeComponent } from './dashboard-home.component';
import { VideogamesListComponent } from './videogames/videogames-list.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { ReviewReadComponent } from './reviews/review-read.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: '',
    component: WelcomeComponent,
    children: [
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'library', component: VideogamesListComponent },
      { path: 'game/:id', component: GameDetailComponent },
      { path: 'shopping', component: ShoppingComponent },
      { path: 'reviews', component: ReviewReadComponent },
      { path: 'settings', component: SettingsComponent },
      // Redirecciones de compatibilidad
      { path: 'videogames/list', redirectTo: '/library', pathMatch: 'full' },
      { path: 'reviews/read', redirectTo: '/reviews', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

