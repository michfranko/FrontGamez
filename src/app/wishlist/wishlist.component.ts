import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishlistRepository } from '../core/repositories/wishlist.repository';
import { WishlistItem } from '../models/entities/wishlist.model';
import { generateUUID } from '../shared/helpers/uuid.helper';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];
  newItem: Partial<WishlistItem> = {
    nombre: '',
    plataforma: 'PlayStation',
    prioridad: 'alta',
    notas: '',
    precioBase: 0
  };

  private wishlistRepo = inject(WishlistRepository);
  private toastService = inject(ToastService);

  async ngOnInit() {
    await this.loadItems();
  }

  async loadItems() {
    try {
      this.items = await this.wishlistRepo.getAll();
    } catch (err) {
      console.error(err);
    }
  }

  async addItem() {
    if (!this.newItem.nombre) return;

    const item: WishlistItem = {
      id: generateUUID(),
      nombre: this.newItem.nombre,
      plataforma: this.newItem.plataforma || 'Otra',
      prioridad: this.newItem.prioridad || 'media',
      notas: this.newItem.notas || '',
      fechaAgregado: new Date().toISOString().split('T')[0],
      precioBase: this.newItem.precioBase || 0
    };

    await this.wishlistRepo.create(item);
    this.toastService.success(`"${item.nombre}" añadido a tu Lista de Deseos`);
    this.newItem = { nombre: '', plataforma: 'PlayStation', prioridad: 'alta', notas: '', precioBase: 0 };
    await this.loadItems();
  }

  async deleteItem(id: string) {
    await this.wishlistRepo.delete(id);
    this.toastService.info('Elemento eliminado de la lista');
    await this.loadItems();
  }
}
