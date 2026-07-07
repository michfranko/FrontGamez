export interface Review {
  game_id: string; // UUID (references games.id)
  calificacion: string | number;
  texto: string;
}
