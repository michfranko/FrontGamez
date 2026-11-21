import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WishlistRepository } from '../core/repositories/wishlist.repository';
import { ShoppingRepository } from '../core/repositories/shopping.repository';
import { WishlistItem } from '../models/entities/wishlist.model';
import { generateUUID } from '../shared/helpers/uuid.helper';
import { ToastService } from '../core/services/toast.service';
import { PlatformSelectorComponent } from '../shared/components/platform-selector.component';
import { EmptyStateComponent } from '../shared/components/empty-state.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule, PlatformSelectorComponent, EmptyStateComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];
  newItem: Partial<WishlistItem> = {
    nombre: '',
    plataforma: 'PC',
    prioridad: 'media',
    notas: '',
    precioBase: 0
  };

  private wishlistRepo = inject(WishlistRepository);
  private shoppingRepo = inject(ShoppingRepository);
  private toastService = inject(ToastService);
  private router = inject(Router);

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
      plataforma: this.newItem.plataforma || 'PC',
      prioridad: this.newItem.prioridad || 'media',
      notas: this.newItem.notas || '',
      fechaAgregado: new Date().toISOString().split('T')[0],
      precioBase: this.newItem.precioBase || 0
    };

    await this.wishlistRepo.create(item);
    this.toastService.showSuccess(`"${item.nombre}" añadido a tu Wishlist`);
    this.newItem = { nombre: '', plataforma: 'PC', prioridad: 'media', notas: '', precioBase: 0 };
    await this.loadItems();
  }

  async moveToShopping(item: WishlistItem) {
    // 1. Obtener o crear lista de compras activa
    let lists = await this.shoppingRepo.getAllLists();
    let targetListId = '';

    if (lists.length === 0) {
      targetListId = generateUUID();
      await this.shoppingRepo.createList({
        id: targetListId,
        nombre: 'Lista Principal de Compras',
        fechaCreacion: new Date().toISOString().split('T')[0],
        presupuesto: 100
      });
    } else {
      targetListId = lists[0].id;
    }

    // 2. Crear item en lista de compras
    await this.shoppingRepo.createItem({
      id: generateUUID(),
      list_id: targetListId,
      nombre: `${item.nombre} (${item.plataforma})`,
      precioBase: item.precioBase || 0,
      tienda: '',
      porcentajeImpuesto: 0,
      cantidad: 1,
      comprado: false,
      seleccionado: true,
      origenWishlist: true
    });

    // 3. Eliminar de wishlist
    await this.wishlistRepo.delete(item.id);
    this.toastService.showSuccess(`"${item.nombre}" movido a tu Lista de Compras`);
    await this.loadItems();
    this.router.navigate(['/shopping']);
  }

  async deleteItem(id: string) {
    await this.wishlistRepo.delete(id);
    this.toastService.showSuccess('Elemento eliminado de la Wishlist');
    await this.loadItems();
  }
}
