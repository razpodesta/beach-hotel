/**
 * @file revenue.engine.ts
 * @description Motor matemático para el Silo A (Revenue).
 */
export const calculateNetPrice = (price: number, discount: number) => price * (1 - discount / 100);

export const calculateStockHealth = (stock: number, capacity: number) => ({
  percent: (stock / capacity) * 100,
  isCritical: stock <= 3
});