import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../core/services/settings.service';
import { GameRepository } from '../core/repositories/game.repository';
import { ReviewRepository } from '../core/repositories/review.repository';
import { WishlistRepository } from '../core/repositories/wishlist.repository';
import { ShoppingRepository } from '../core/repositories/shopping.repository';
import { GameService } from '../core/services/game.service';
import { ReviewService } from '../core/services/review.service';
import { ToastService } from '../core/services/toast.service';
import { AppSettings } from '../models/entities/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settings: AppSettings = {
    tema: 'dark',
    idioma: 'es',
    formatoFecha: 'YYYY-MM-DD',
    moneda: 'USD'
  };

  exporting = false;
  importing = false;

  private settingsService = inject(SettingsService);
  private gameRepo = inject(GameRepository);
  private reviewRepo = inject(ReviewRepository);
  private wishlistRepo = inject(WishlistRepository);
  private shoppingRepo = inject(ShoppingRepository);
  private gameService = inject(GameService);
  private reviewService = inject(ReviewService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.settingsService.settings$.subscribe((s) => {
      this.settings = { ...s };
    });
  }

  async updateSetting(key: keyof AppSettings, value: string) {
    await this.settingsService.setSetting(key, value);
    this.toastService.showSuccess('Configuración actualizada con éxito.');
  }

  async exportCollection() {
    this.exporting = true;
    try {
      const games = await this.gameRepo.getAll();
      const reviews = await this.reviewRepo.getAll();
      const wishlist = await this.wishlistRepo.getAll();
      const shoppingLists = await this.shoppingRepo.getAllLists();

      const shoppingItems: any[] = [];
      for (const list of shoppingLists) {
        const items = await this.shoppingRepo.getItemsByListId(list.id);
        shoppingItems.push(...items);
      }

      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        games,
        reviews,
        wishlist,
        shoppingLists,
        shoppingItems
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `gamevault_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.toastService.showSuccess('Colección exportada correctamente.');
    } catch (err) {
      this.toastService.showError('Error al exportar la colección.');
    } finally {
      this.exporting = false;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        if (!backupData || typeof backupData !== 'object' || !Array.isArray(backupData.games)) {
          throw new Error('El archivo no tiene el formato de respaldo de GameVault.');
        }

        if (!confirm(`Se importarán ${backupData.games.length} juegos. ¿Deseas continuar?`)) {
          return;
        }

        this.importing = true;

        // 1. Restaurar Juegos
        for (const game of backupData.games) {
          const existing = this.gameService.getGameByIdFromState(game.id);
          if (existing) {
            await this.gameRepo.update(game);
          } else {
            await this.gameRepo.create(game);
          }
        }

        // 2. Restaurar Reseñas
        if (Array.isArray(backupData.reviews)) {
          for (const rev of backupData.reviews) {
            await this.reviewRepo.save({ game_id: rev.game_id, calificacion: rev.calificacion, texto: rev.texto });
          }
        }


        // 3. Restaurar Wishlist
        if (Array.isArray(backupData.wishlist)) {
          for (const wish of backupData.wishlist) {
            await this.wishlistRepo.create(wish);
          }
        }

        // 4. Restaurar Listas de Compras
        if (Array.isArray(backupData.shoppingLists)) {
          for (const list of backupData.shoppingLists) {
            await this.shoppingRepo.createList(list);
          }
        }
        if (Array.isArray(backupData.shoppingItems)) {
          for (const sItem of backupData.shoppingItems) {
            await this.shoppingRepo.createItem(sItem);
          }
        }

        await this.gameService.refresh();
        await this.reviewService.refresh();
        this.toastService.showSuccess('Colección importada con éxito.');
      } catch (err: any) {
        this.toastService.showError(`Error de importación: ${err?.message || 'Archivo inválido'}`);
      } finally {
        this.importing = false;
        input.value = '';
      }
    };

    reader.readAsText(file);
  }
}
