export interface Game {
  id: string; // UUID
  nombre: string;
  tipo: string; // Género
  estado: string; // 'pendiente', 'jugando', 'terminado'
  version: string; // 'digital', 'fisico'
  plataforma: string;
  prioridad: string; // 'alta', 'media', 'baja'
  fechaIncorporacion: string; // YYYY-MM-DD
  fechaFinalizacion: string | null; // YYYY-MM-DD
  anioLanzamiento: string | number;
  calificacion: string | number | null;
  coverPath: string | null;
  bannerPath: string | null;
}
