export interface WishlistItem {
  id: string;
  nombre: string;
  plataforma: string;      // Tienda de compra (Amazon, PlayStation, Steam, etc.)
  prioridad: string;       // 'alta', 'media', 'baja'
  notas: string | null;
  fechaAgregado: string;   // YYYY-MM-DD
  precioBase: number;      // Precio en USD antes de impuesto
}
