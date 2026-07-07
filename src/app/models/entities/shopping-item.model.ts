export interface ShoppingItem {
  id: string; // UUID
  list_id: string; // References shopping_lists.id
  nombre: string;
  precio: number;
  comprado: boolean; // boolean representing 0/1 in SQLite
}
