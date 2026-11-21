export interface CollectionItem {
  id: string; // UUID
  gameId: string; // ID del juego canónico
  nombre: string;
  plataforma: string;
  estado: 'pendiente' | 'jugando' | 'terminado' | string;
  version: 'digital' | 'fisico' | string; // formato
  prioridad: 'alta' | 'media' | 'baja' | string;
  calificacion: number | string | null;
  fechaIncorporacion: string;
  fechaFinalizacion: string | null;
  favorito: boolean;
  genres?: string[];
  anioLanzamiento?: string | number;
}
