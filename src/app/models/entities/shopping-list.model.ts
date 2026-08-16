export interface ShoppingList {
  id: string; // UUID
  nombre: string;
  fechaCreacion: string; // YYYY-MM-DD HH:mm:ss
  presupuesto?: number; // opcional, monto máximo de la lista
}
