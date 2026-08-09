import { Routes } from '@angular/router';

import { WelcomeComponent } from './welcome.component';
import { VideogamesListComponent } from './videogames/videogames-list.component';
import { VideogamesAddComponent } from './videogames/videogames-add.component';
import { ReviewCreateComponent } from './reviews/review-create.component';
import { ReviewReadComponent } from './reviews/review-read.component';
import { DashboardHomeComponent } from './dashboard-home.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: WelcomeComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'videogames/list', component: VideogamesListComponent },
      { path: 'videogames/add', component: VideogamesAddComponent },
      { path: 'reviews/create', component: ReviewCreateComponent },
      { path: 'reviews/read', component: ReviewReadComponent },
      { path: 'shopping', component: ShoppingComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  }
];
