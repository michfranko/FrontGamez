import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardMenuComponent } from './dashboard-menu/dashboard-menu.component';
import { GameService } from './core/services/game.service';
import { Game } from './models/entities/game.model';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardMenuComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  games: Game[] = [];

  private gameService = inject(GameService);

  constructor() {}

  ngOnInit() {
    // Suscribirse de manera reactiva al estado de los juegos
    this.gameService.games$.subscribe((games: Game[]) => {
      this.games = games;
    });
  }
}
