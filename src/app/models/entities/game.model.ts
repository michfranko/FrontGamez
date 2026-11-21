export interface Game {
  id: string; // UUID de la copia en colección
  gameId?: string; // ID del juego canónico (para detectar duplicados en distintas plataformas)
  nombre: string;
  tipo: string; // Géneros concatenados (e.g. 'RPG / Acción')
  genres?: string[]; // Array de géneros estructurados
  estado: 'pendiente' | 'jugando' | 'terminado' | string;
  version: 'digital' | 'fisico' | string;
  plataforma: string;
  prioridad: 'alta' | 'media' | 'baja' | string;
  fechaIncorporacion: string; // YYYY-MM-DD
  fechaFinalizacion: string | null; // YYYY-MM-DD
  anioLanzamiento: string | number;
  calificacion: string | number | null;
  favorito?: boolean | number;
}

