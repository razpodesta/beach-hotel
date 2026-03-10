// RUTA: apps/portfolio-web/src/lib/utils/cn.ts

/**
 * @file Utilidad Soberana de Fusión de Clases (The CSS Engine)
 * @version 1.0 - Fase 0: Cimientos Lego
 * @description Orquestador de clases CSS que combina la evaluación condicional
 *              de `clsx` con la resolución inteligente de conflictos de `tailwind-merge`.
 *              Este aparato garantiza que las clases inyectadas dinámicamente no
 *              colisionen, manteniendo la especificidad y la pureza visual de Tailwind v4.
 * @author Raz Podestá - MetaShark Tech
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusiona y resuelve conflictos de clases de Tailwind CSS de forma segura.
 * 
 * @param {...ClassValue[]} inputs - Lista de clases, arrays u objetos condicionales.
 * @returns {string} Cadena de clases CSS purgada y resuelta lista para inyectar en el DOM.
 * 
 * @example
 * // Retorna 'bg-white text-black' (resuelve el conflicto bg-black vs bg-white)
 * cn('bg-black text-white', 'bg-white text-black');
 * 
 * @example
 * // Uso con condicionales
 * cn('p-4', { 'opacity-50': isLoading });
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}