import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '../core/services/game.service';
import { ReviewService } from '../core/services/review.service';
import { Game } from '../models/entities/game.model';
import { GameCardComponent } from '../shared/components/game-card.component';
import { EmptyStateComponent } from '../shared/components/empty-state.component';
import { LoadingStateComponent } from '../shared/components/loading-state.component';
import { VideogamesAddComponent } from './videogames-add.component';
import { CONTROLLED_PLATFORMS } from '../shared/components/platform-selector.component';
import { CONTROLLED_GENRES } from '../shared/components/genre-selector.component';

@Component({
  selector: 'app-videogames-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GameCardComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    VideogamesAddComponent
  ],
  templateUrl: './videogames-list.component.html',
  styleUrls: ['./videogames-list.component.css']
})
export class VideogamesListComponent implements OnInit {
  allGames: Game[] = [];
  filteredGames: Game[] = [];
  loading = true;

  // Filtros y Pestañas
  activeTab: 'todos' | 'jugando' | 'pendiente' | 'terminado' | 'favoritos' = 'todos';
  searchTerm: string = '';
  platformFilter: string = '';
  genreFilter: string = '';
  sortOption: string = 'fecha-reciente';

  // Modal Agregar
  showAddModal = false;

  availablePlatforms = CONTROLLED_PLATFORMS;
  availableGenres = CONTROLLED_GENRES;

  private gameService = inject(GameService);
  private reviewService = inject(ReviewService);
  private router = inject(Router);

  private searchDebounceTimer: any = null;

  ngOnInit() {
    this.gameService.games$.subscribe(games => {
      this.allGames = games;
      this.loading = false;
      this.applyFilters();
    });
  }

  setTab(tab: 'todos' | 'jugando' | 'pendiente' | 'terminado' | 'favoritos') {
    this.activeTab = tab;
    this.applyFilters();
  }

  onSearchInput() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.applyFilters();
    }, 250);
  }

  applyFilters() {
    let result = [...this.allGames];

    // 1. Filtrar por Pestaña
    if (this.activeTab === 'favoritos') {
      result = result.filter(g => Boolean(g.favorito));
    } else if (this.activeTab !== 'todos') {
      result = result.filter(g => (g.estado || '').toLowerCase() === this.activeTab);
    }

    // 2. Búsqueda por texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(g =>
        g.nombre.toLowerCase().includes(term) ||
        (g.tipo && g.tipo.toLowerCase().includes(term)) ||
        (g.plataforma && g.plataforma.toLowerCase().includes(term))
      );
    }

    // 3. Filtro por Plataforma
    if (this.platformFilter) {
      result = result.filter(g => g.plataforma === this.platformFilter);
    }

    // 4. Filtro por Género
    if (this.genreFilter) {
      result = result.filter(g =>
        g.tipo && g.tipo.toLowerCase().includes(this.genreFilter.toLowerCase())
      );
    }

    // 5. Ordenamiento
    this.applySort(result);
  }

  private applySort(games: Game[]) {
    switch (this.sortOption) {
      case 'calificacion-desc':
        this.filteredGames = games.sort((a, b) => (Number(b.calificacion) || 0) - (Number(a.calificacion) || 0));
        break;
      case 'calificacion-asc':
        this.filteredGames = games.sort((a, b) => (Number(a.calificacion) || 0) - (Number(b.calificacion) || 0));
        break;
      case 'nombre-asc':
        this.filteredGames = games.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        this.filteredGames = games.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'fecha-antigua':
        this.filteredGames = games.sort((a, b) => (a.fechaIncorporacion || '').localeCompare(b.fechaIncorporacion || ''));
        break;
      case 'fecha-reciente':
      default:
        this.filteredGames = games.sort((a, b) => (b.fechaIncorporacion || '').localeCompare(a.fechaIncorporacion || ''));
        break;
    }
  }

  onGameClick(game: Game) {
    this.router.navigate(['/game', game.id]);
  }

  async onToggleFavorite(game: Game) {
    await this.gameService.toggleFavorite(game.id);
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }
}
