import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @description Utilidad interna de fusión de clases para la librería.
 *              Garantiza que los componentes sean agnósticos al host.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}