import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingRepository } from '../core/repositories/shopping.repository';
import { PriceCalculatorService, TaxStore } from '../core/services/price-calculator.service';
import { ToastService } from '../core/services/toast.service';
import { ShoppingList } from '../models/entities/shopping-list.model';
import { ShoppingItem, ShoppingItemCalculado } from '../models/entities/shopping-item.model';
import { generateUUID } from '../shared/helpers/uuid.helper';

type ItemSort = 'nombre' | 'precioAsc' | 'precioDesc' | 'prioridad' | 'estado' | 'fecha';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit {
  lists: ShoppingList[] = [];
  selectedList: ShoppingList | null = null;
  items: ShoppingItemCalculado[] = [];
  itemSort: ItemSort = 'nombre';

  newListName = '';
  showListForm = false;
  newItem: Partial<ShoppingItem> = this.emptyItem();
  showItemForm = false;
  taxStores: TaxStore[] = [];
  resumen = { subtotalBase: 0, totalImpuesto: 0, totalFinal: 0, subtotalComprado: 0 };

  private shopRepo = inject(ShoppingRepository);
  private calc = inject(PriceCalculatorService);
  private toastSvc = inject(ToastService);
  private statusHoldTimer: any = null;
  private longPressTriggered = false;

  async ngOnInit() {
    await this.calc.loadTaxRates();
    this.taxStores = this.calc.getTaxStores();
    await this.loadLists();
  }

  async loadLists() {
    this.lists = await this.shopRepo.getAllLists();
    if (this.lists.length > 0 && !this.selectedList) {
      this.selectedList = this.lists[0];
      await this.loadItems();
    } else if (this.selectedList) {
      const found = this.lists.find(list => list.id === this.selectedList?.id);
      this.selectedList = found ?? this.lists[0] ?? null;
      if (this.selectedList) await this.loadItems();
    }
  }

  async selectList(list: ShoppingList) {
    this.selectedList = list;
    await this.loadItems();
    this.showItemForm = false;
  }

  async loadItems() {
    if (!this.selectedList) {
      this.items = [];
      this.resumen = { subtotalBase: 0, totalImpuesto: 0, totalFinal: 0, subtotalComprado: 0 };
      return;
    }
    const raw = await this.shopRepo.getItemsByListId(this.selectedList.id);
    this.items = raw.map(item => this.calcularItem(item));
    this.resumen = this.getTotalsForItems(this.items);
  }

  getTotalsForItems(items: ShoppingItemCalculado[]) {
    const subtotalBase = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalImpuesto = items.reduce((sum, item) => sum + item.montoImpuesto, 0);
    const totalFinal = items.reduce((sum, item) => sum + item.precioFinal, 0);
    const subtotalComprado = items.filter(item => item.comprado).reduce((sum, item) => sum + item.precioFinal, 0);
    return { subtotalBase, totalImpuesto, totalFinal, subtotalComprado };
  }

  calcularItem(item: ShoppingItem): ShoppingItemCalculado {
    const subtotal = (item.precioBase || 0) * (item.cantidad || 1);
    const montoImpuesto = this.calc.calcularImpuesto(item.precioBase || 0, item.cantidad || 1, item.porcentajeImpuesto || 0);
    const precioFinal = subtotal + montoImpuesto;
    return { ...item, subtotal, montoImpuesto, precioFinal, seleccionado: !!item.seleccionado, comprado: !!item.comprado };
  }

  emptyItem(): Partial<ShoppingItem> {
    return { nombre: '', precioBase: 0, tienda: 'Amazon', porcentajeImpuesto: 10, cantidad: 1, comprado: false, seleccionado: false };
  }

  onTiendaChange() {
    const pct = this.calc.getPorcentajeByLabel(this.newItem.tienda || '');
    this.newItem.porcentajeImpuesto = pct;
  }

  async createList() {
    if (!this.newListName.trim()) return;
    const list: ShoppingList = {
      id: generateUUID(),
      nombre: this.newListName.trim(),
      fechaCreacion: new Date().toISOString().split('T')[0],
      presupuesto: 0
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
      comprado: false,
      seleccionado: false,
      origenWishlist: false
    };

    await this.shopRepo.createItem(item);
    this.toastSvc.success(`"${item.nombre}" agregado`);
    this.newItem = this.emptyItem();
    this.showItemForm = false;
    await this.loadItems();
  }

  startStatusHold(item: ShoppingItemCalculado, event?: Event) {
    if (event) {
      event.preventDefault();
    }

    this.cancelStatusHold();
    this.longPressTriggered = false;

    this.statusHoldTimer = setTimeout(() => {
      this.longPressTriggered = true;
      this.cycleStatus(item);
    }, 400);
  }

  cancelStatusHold() {
    if (this.statusHoldTimer) {
      clearTimeout(this.statusHoldTimer);
      this.statusHoldTimer = null;
    }
  }

  async handleStatusClick(item: ShoppingItemCalculado) {
    if (this.longPressTriggered) {
      this.longPressTriggered = false;
      return;
    }

    await this.cycleStatus(item);
  }

  async cycleStatus(item: ShoppingItemCalculado) {
    let nextSelected = item.seleccionado;
    let nextBought = item.comprado;

    if (item.comprado) {
      nextBought = false;
      nextSelected = false;
    } else if (item.seleccionado) {
      nextBought = true;
      nextSelected = false;
    } else {
      nextSelected = true;
      nextBought = false;
    }

    await this.shopRepo.updateItemStatus(item.id, nextBought, nextSelected);
    await this.loadItems();
  }

  async toggleStatus(item: ShoppingItemCalculado) {
    await this.cycleStatus(item);
  }

  async toggleSelection(item: ShoppingItemCalculado) {
    await this.shopRepo.updateItemSelection(item.id, !item.seleccionado);
    await this.loadItems();
  }

  async clearSelection() {
    for (const item of this.items.filter(i => i.seleccionado)) {
      await this.shopRepo.updateItemSelection(item.id, false);
    }
    await this.loadItems();
  }

  async buySelected() {
    const selected = this.items.filter(item => item.seleccionado);
    if (selected.length === 0) return;

    const total = this.getSelectedSummary().totalFinal;
    const confirmed = confirm(`¿Confirmar compra de ${selected.length} productos por ${this.fmt(total)}?`);
    if (!confirmed) return;

    for (const item of selected) {
      await this.shopRepo.updateItemStatus(item.id, true, false);
    }
    await this.loadItems();
    this.toastSvc.success('Productos confirmados como comprados');
  }

  async saveListBudget() {
    if (!this.selectedList) return;
    const presupuesto = Number(this.selectedList.presupuesto ?? 0) || 0;
    await this.shopRepo.updateListBudget(this.selectedList.id, presupuesto);
    this.toastSvc.success('Presupuesto actualizado');
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

  get filteredItems(): ShoppingItemCalculado[] {
    const result = [...this.items];

    switch (this.itemSort) {
      case 'precioAsc':
        result.sort((a, b) => a.precioFinal - b.precioFinal); break;
      case 'precioDesc':
        result.sort((a, b) => b.precioFinal - a.precioFinal); break;
      case 'prioridad':
        result.sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a)); break;
      case 'estado':
        result.sort((a, b) => this.getStateScore(b) - this.getStateScore(a)); break;
      case 'fecha':
        result.sort((a, b) => a.id.localeCompare(b.id)); break;
      default:
        result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return result;
  }

  getPriorityScore(item: ShoppingItemCalculado): number {
    if (item.comprado) return 5;
    if (item.seleccionado) return 4;
    return 3;
  }

  getStateScore(item: ShoppingItemCalculado): number {
    if (item.comprado) return 3;
    if (item.seleccionado) return 2;
    return 1;
  }

  getStatusLabel(item: ShoppingItemCalculado): string {
    if (item.comprado) return 'Comprado';
    if (item.seleccionado) return 'Seleccionado';
    return 'Pendiente';
  }

  getStatusClass(item: ShoppingItemCalculado): string {
    if (item.comprado) return 'status-success';
    if (item.seleccionado) return 'status-info';
    return 'status-warn';
  }

  getSelectedSummary() {
    const selectedItems = this.items.filter(item => item.seleccionado);
    return this.getTotalsForItems(selectedItems);
  }

  getBoughtSummary() {
    const boughtItems = this.items.filter(item => item.comprado);
    return this.getTotalsForItems(boughtItems);
  }

  get selectedItemsCount(): number { return this.items.filter(item => item.seleccionado).length; }
  get itemsCompradosCount(): number { return this.items.filter(item => item.comprado).length; }
  get progresoPct(): number { if (this.items.length === 0) return 0; return Math.round((this.items.filter(i => i.comprado).length / this.items.length) * 100); }
  get selectedSubtotal(): number { return this.getSelectedSummary().subtotalBase; }
  get selectedImpuestos(): number { return this.getSelectedSummary().totalImpuesto; }
  get selectedTotal(): number { return this.getSelectedSummary().totalFinal; }
  get boughtTotal(): number { return this.getBoughtSummary().subtotalComprado; }
  get presupuestoDisponible(): number {
    if (!this.selectedList || !(this.selectedList.presupuesto ?? 0)) return 0;
    return (this.selectedList.presupuesto ?? 0) - this.getSelectedSummary().totalFinal;
  }

  get presupuestoRestante(): number {
    if (!this.selectedList || !(this.selectedList.presupuesto ?? 0)) return 0;
    return (this.selectedList.presupuesto ?? 0) - this.getSelectedSummary().totalFinal;
  }

  get presupuestoEstado(): string {
    if (!this.selectedList) return 'Sin lista seleccionada';
    const presupuesto = Number(this.selectedList.presupuesto ?? 0) || 0;
    const costoEstimado = this.getSelectedSummary().totalFinal;

    if (!presupuesto) return `Costo estimado actual: ${this.fmt(costoEstimado)}.`;

    const diff = costoEstimado - presupuesto;
    if (diff > 0) return `Costo estimado: ${this.fmt(costoEstimado)} · Supera tu presupuesto por ${this.fmt(diff)}.`;
    if (diff === 0) return `Costo estimado: ${this.fmt(costoEstimado)} · Presupuesto al límite.`;
    return `Costo estimado: ${this.fmt(costoEstimado)} · Restante: ${this.fmt(presupuesto - costoEstimado)}.`;
  }

  fmt(v: number): string {
    return `$${v.toFixed(2)}`;
  }
}
