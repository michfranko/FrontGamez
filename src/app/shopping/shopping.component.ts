import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishlistRepository } from '../core/repositories/wishlist.repository';
import { ShoppingRepository } from '../core/repositories/shopping.repository';
import { PriceCalculatorService, TaxStore } from '../core/services/price-calculator.service';
import { ToastService } from '../core/services/toast.service';
import { WishlistItem } from '../models/entities/wishlist.model';
import { ShoppingList } from '../models/entities/shopping-list.model';
import { ShoppingItem, ShoppingItemCalculado } from '../models/entities/shopping-item.model';
import { generateUUID } from '../shared/helpers/uuid.helper';

type Tab = 'wishlist' | 'shopping';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit {
  activeTab: Tab = 'wishlist';

  // ─── WISHLIST ───────────────────────────────────────────────
  wishlistItems: WishlistItem[] = [];
  newWishItem: Partial<WishlistItem> = this.emptyWish();
  showWishForm = false;

  // ─── SHOPPING ───────────────────────────────────────────────
  lists: ShoppingList[] = [];
  selectedList: ShoppingList | null = null;
  items: ShoppingItemCalculado[] = [];

  newListName = '';
  showListForm = false;

  newItem: Partial<ShoppingItem> = this.emptyItem();
  showItemForm = false;
  selectedWishId = '';

  // Impuestos disponibles
  taxStores: TaxStore[] = [];

  // Resumen de la lista seleccionada
  resumen = { subtotalBase: 0, totalImpuesto: 0, totalFinal: 0, subtotalComprado: 0 };

  private wishRepo    = inject(WishlistRepository);
  private shopRepo    = inject(ShoppingRepository);
  private calc        = inject(PriceCalculatorService);
  private toastSvc    = inject(ToastService);

  async ngOnInit() {
    await this.calc.loadTaxRates();
    this.taxStores = this.calc.getTaxStores();
    await this.loadWishlist();
    await this.loadLists();
  }

  setTab(tab: Tab) { this.activeTab = tab; }

  // ─── WISHLIST ─────────────────────────────────────────
  async loadWishlist() {
    this.wishlistItems = await this.wishRepo.getAll();
  }

  emptyWish(): Partial<WishlistItem> {
    return { nombre: '', plataforma: 'Amazon', prioridad: 'alta', notas: '', precioBase: 0 };
  }

  onTiendaWishChange() {
    // no-op: porcentaje se muestra en cálculo
  }

  getPrecioFinalWish(item: WishlistItem): number {
    const pct = this.calc.getPorcentajeByLabel(item.plataforma);
    return this.calc.calcularPrecioFinal(item.precioBase, 1, pct);
  }

  getImpuestoWish(item: WishlistItem): number {
    const pct = this.calc.getPorcentajeByLabel(item.plataforma);
    return this.calc.calcularImpuesto(item.precioBase, 1, pct);
  }

  getPctWish(item: WishlistItem): number {
    return this.calc.getPorcentajeByLabel(item.plataforma);
  }

  getTotalWishlist(): number {
    return this.wishlistItems.reduce((sum, i) => sum + this.getPrecioFinalWish(i), 0);
  }

  async addWishItem() {
    if (!this.newWishItem.nombre) return;
    const item: WishlistItem = {
      id: generateUUID(),
      nombre: this.newWishItem.nombre!,
      plataforma: this.newWishItem.plataforma || 'Otra',
      prioridad: this.newWishItem.prioridad || 'media',
      notas: this.newWishItem.notas || '',
      fechaAgregado: new Date().toISOString().split('T')[0],
      precioBase: Number(this.newWishItem.precioBase) || 0
    };
    await this.wishRepo.create(item);
    this.toastSvc.success(`"${item.nombre}" añadido a tu Lista de Deseos`);
    this.newWishItem = this.emptyWish();
    this.showWishForm = false;
    await this.loadWishlist();
  }

  async deleteWishItem(id: string) {
    await this.wishRepo.delete(id);
    this.toastSvc.info('Elemento eliminado de la lista de deseos');
    await this.loadWishlist();
  }

  async moveToShopping(item: WishlistItem) {
    if (this.lists.length === 0) {
      this.toastSvc.warning('Crea primero una lista de compras en la pestaña "Compras Gaming"');
      return;
    }
    const targetList = this.selectedList || this.lists[0];
    const pct = this.calc.getPorcentajeByLabel(item.plataforma);
    const shopItem: ShoppingItem = {
      id: generateUUID(),
      list_id: targetList.id,
      nombre: item.nombre,
      precioBase: item.precioBase,
      tienda: item.plataforma,
      porcentajeImpuesto: pct,
      cantidad: 1,
      comprado: false
    };
    await this.shopRepo.createItem(shopItem);
    await this.wishRepo.delete(item.id);
    this.toastSvc.success(`"${item.nombre}" movido a la lista "${targetList.nombre}"`);
    await this.loadWishlist();
    if (this.selectedList?.id === targetList.id) await this.loadItems();
  }

  // ─── SHOPPING ─────────────────────────────────────────
  async loadLists() {
    this.lists = await this.shopRepo.getAllLists();
    if (this.lists.length > 0 && !this.selectedList) {
      await this.selectList(this.lists[0]);
    }
  }

  async selectList(list: ShoppingList) {
    this.selectedList = list;
    await this.loadItems();
    this.showItemForm = false;
  }

  async loadItems() {
    if (!this.selectedList) { this.items = []; return; }
    const raw = await this.shopRepo.getItemsByListId(this.selectedList.id);
    this.items = raw.map(item => this.calcularItem(item));
    this.resumen = this.calc.calcularResumenLista(this.items);
  }

  calcularItem(item: ShoppingItem): ShoppingItemCalculado {
    const subtotal     = (item.precioBase || 0) * (item.cantidad || 1);
    const montoImpuesto = this.calc.calcularImpuesto(item.precioBase || 0, item.cantidad || 1, item.porcentajeImpuesto || 0);
    const precioFinal  = subtotal + montoImpuesto;
    return { ...item, subtotal, montoImpuesto, precioFinal };
  }

  emptyItem(): Partial<ShoppingItem> {
    return { nombre: '', precioBase: 0, tienda: 'Amazon', porcentajeImpuesto: 10, cantidad: 1 };
  }

  onTiendaChange() {
    const pct = this.calc.getPorcentajeByLabel(this.newItem.tienda || '');
    this.newItem.porcentajeImpuesto = pct;
  }

  onWishlistSelectChange() {
    const wishItem = this.wishlistItems.find(w => w.id === this.selectedWishId);
    if (wishItem) {
      this.newItem = {
        ...this.newItem,
        nombre: wishItem.nombre,
        precioBase: wishItem.precioBase,
        tienda: wishItem.plataforma,
        porcentajeImpuesto: this.calc.getPorcentajeByLabel(wishItem.plataforma)
      };
    }
  }

  async createList() {
    if (!this.newListName.trim()) return;
    const list: ShoppingList = {
      id: generateUUID(),
      nombre: this.newListName.trim(),
      fechaCreacion: new Date().toISOString().split('T')[0]
    };
    await this.shopRepo.createList(list);
    this.toastSvc.success(`Lista "${list.nombre}" creada`);
    this.newListName = '';
    this.showListForm = false;
    await this.loadLists();
    await this.selectList(list);
  }

  async addItem() {
    if (!this.selectedList || !this.newItem.nombre) return;
    const item: ShoppingItem = {
      id: generateUUID(),
      list_id: this.selectedList.id,
      nombre: this.newItem.nombre!,
      precioBase: Number(this.newItem.precioBase) || 0,
      tienda: this.newItem.tienda || 'Otra',
      porcentajeImpuesto: Number(this.newItem.porcentajeImpuesto) || 0,
      cantidad: Number(this.newItem.cantidad) || 1,
      comprado: false
    };
    await this.shopRepo.createItem(item);

    // Si venía de la wishlist, lo eliminamos de allí
    if (this.selectedWishId) {
      await this.wishRepo.delete(this.selectedWishId);
      await this.loadWishlist();
    }

    this.toastSvc.success(`"${item.nombre}" agregado`);
    this.newItem = this.emptyItem();
    this.selectedWishId = '';
    this.showItemForm = false;
    await this.loadItems();
  }

  async toggleStatus(item: ShoppingItemCalculado) {
    await this.shopRepo.updateItemStatus(item.id, !item.comprado);
    await this.loadItems();
  }

  async deleteItem(id: string) {
    await this.shopRepo.deleteItem(id);
    await this.loadItems();
  }

  async deleteList(id: string) {
    if (!confirm('¿Eliminar esta lista y todos sus artículos?')) return;
    await this.shopRepo.deleteList(id);
    this.toastSvc.info('Lista eliminada');
    this.selectedList = null;
    this.items = [];
    this.resumen = { subtotalBase: 0, totalImpuesto: 0, totalFinal: 0, subtotalComprado: 0 };
    await this.loadLists();
  }

  get progresoPct(): number {
    if (this.items.length === 0) return 0;
    return Math.round((this.items.filter(i => i.comprado).length / this.items.length) * 100);
  }

  get itemsCompradosCount(): number {
    return this.items.filter(i => i.comprado).length;
  }

  fmt(v: number): string {
    return `$${v.toFixed(2)}`;
  }
}
