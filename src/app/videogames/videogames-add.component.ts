import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../core/services/game.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-videogames-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videogames-add.component.html',
  styleUrls: ['./videogames-add.component.css']
})
export class VideogamesAddComponent {
  genreOptions = [
    'Acción',
    'Aventura',
    'Terror',
    'Shooter',
    'RPG',
    'RPG de acción',
    'Estrategia',
    'Simulación',
    'Deportes',
    'Carreras',
    'Plataformas',
    'Puzzle',
    'Metroidvania',
    'Bullet Hell',
    'Beat ’em up',
    'Fighting',
    'Sandbox',
    'Survival',
    'Roguelike',
    'Hack and slash',
    'soulslike',
    'Stealth',
    'Cooperativo',
    'Multijugador',
    'Arcade',
    'Casual',
    'Mundo abierto',
    'Narrativo',
    'Visual Novel',
    'Indie'
  ];

  game: any = {
    nombre: '',
    tipo: '',
    estado: 'pendiente',
    version: 'digital',
    plataforma: '',
    prioridad: 'media',
    fechaIncorporacion: new Date().toISOString().split('T')[0],
    fechaFinalizacion: null,
    calificacion: null,
    coverPath: null,
    bannerPath: null
  };

  private gameService = inject(GameService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  constructor() {}

  async addVideogame() {
    if (!this.game.nombre || !this.game.plataforma || !this.game.tipo) return;
    const { calificacion, ...gameData } = this.game;
    await this.gameService.addGame(gameData);
    this.toastService.success(`"${this.game.nombre}" agregado con éxito`);
    this.resetForm();
    this.router.navigate(['/dashboard/videogames/list']);
  }

  resetForm() {
    this.game = {
      nombre: '',
      tipo: '',
      estado: 'pendiente',
      version: 'digital',
      plataforma: '',
      prioridad: 'media',
      fechaIncorporacion: new Date().toISOString().split('T')[0],
      fechaFinalizacion: null,
      calificacion: null,
      coverPath: null,
      bannerPath: null
    };
  }
}
