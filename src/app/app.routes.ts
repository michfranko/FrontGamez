import { Routes } from '@angular/router';

import { VideogamesListComponent } from './videogames/videogames-list.component';
import { VideogamesAddComponent } from './videogames/videogames-add.component';
import { WelcomeComponent } from './welcome.component';
import { ReviewCreateComponent } from './reviews/review-create.component';
import { ReviewReadComponent } from './reviews/review-read.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  {
    path: 'videogames',
    children: [
      { path: 'list', component: VideogamesListComponent },
      { path: 'add', component: VideogamesAddComponent }
    ]
  }
  ,
  {
    path: 'reviews',
    children: [
      { path: 'create', component: ReviewCreateComponent },
      { path: 'read', component: ReviewReadComponent }
    ]
  }
];
