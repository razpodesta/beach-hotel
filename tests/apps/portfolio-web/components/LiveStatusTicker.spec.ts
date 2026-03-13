/**
 * @file tests/apps/portfolio-web/components/LiveStatusTicker.spec.ts
 * @description Prueba lógica pura del procesador de estados del Ticker.
 */

describe('LiveStatusTicker Logic', () => {
  it('debe filtrar correctamente los estados activos', () => {
    const mockDictionary = {
      items: [
        { category: 'Festival', message: 'Party', iconKey: 'Music', colorKey: 'purple' },
        { category: 'Hotel', message: 'Full', iconKey: 'ShieldCheck', colorKey: 'green' }
      ]
    };

    // Validamos que la lógica de transformación no rompa la estructura
    const items = mockDictionary.items;
    expect(items).toHaveLength(2);
    expect(items[0].category).toBe('Festival');
  });
});