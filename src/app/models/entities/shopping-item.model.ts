export interface ShoppingItem {
  id: string;
  list_id: string;
  nombre: string;
  precioBase: number;          // Precio antes de impuesto
  tienda: string;              // Tienda/plataforma (Amazon, PlayStation, Steam...)
  porcentajeImpuesto: number;  // Porcentaje de impuesto (ej: 10, 15)
  cantidad: number;            // Cantidad de unidades
  comprado: boolean;
  seleccionado?: boolean;      // Estado temporal de selección, no equivale a compra
  origenWishlist?: boolean;    // Indica si el producto fue importado desde la wishlist
}

/** Resultado calculado para un item (no se persiste en BD) */
export interface ShoppingItemCalculado extends ShoppingItem {
  subtotal: number;       // precioBase × cantidad
  montoImpuesto: number;  // subtotal × (porcentajeImpuesto/100)
  precioFinal: number;    // subtotal + montoImpuesto
}
