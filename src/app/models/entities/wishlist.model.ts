export interface WishlistItem {
  id: string; // UUID
  nombre: string;
  plataforma: string;
  prioridad: string; // 'alta', 'media', 'baja'
  notas: string | null;
  fechaAgregado: string; // YYYY-MM-DD
}
