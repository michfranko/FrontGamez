import { ShoppingItem } from './shopping-item.model';

describe('ShoppingItem', () => {
  it('debe soportar estados separados de seleccionado y comprado', () => {
    const item: ShoppingItem = {
      id: '1',
      list_id: 'list-1',
      nombre: 'Elden Ring',
      precioBase: 60,
      tienda: 'Steam',
      porcentajeImpuesto: 15,
      cantidad: 1,
      comprado: false,
      seleccionado: true
    };

    expect(item.comprado).toBeFalse();
    expect(item.seleccionado).toBeTrue();
  });
});
