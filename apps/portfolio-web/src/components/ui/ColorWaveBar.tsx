// RUTA: apps/portfolio-web/src/components/ui/ColorWaveBar.tsx

/**
 * @file Barra de Gradiente Dinámica (WaveBar)
 * @version 3.0 - Semántica & Adaptable
 * @description Barra de acento con gradientes semánticos inyectables.
 *              Soporta variantes 'hotel' (elegante) y 'festival' (neón).
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

type ColorWaveBarProps = {
  /** Posición absoluta de la barra. */
  position?: 'top' | 'bottom';
  /** Variante temática para inyectar colores semánticos. */
  variant?: 'hotel' | 'festival' | 'custom';
  /** Clases adicionales. */
  className?: string;
};

/**
 * Renderiza una barra de gradiente animada. 
 * Utiliza clases semánticas para permitir que el tema defina los colores.
 */
export function ColorWaveBar({
  position = 'bottom',
  variant = 'hotel',
  className,
}: ColorWaveBarProps) {

  // Mapeo de variantes a clases de Tailwind (Tailwind v4)
  const variantStyles = {
    hotel: "from-purple-500 via-pink-500 to-fuchsia-500",
    festival: "from-blue-500 via-purple-500 to-pink-500",
    custom: "from-primary via-accent to-secondary",
  };

  return (
    <div
      className={cn(
        'absolute left-0 w-full h-1 overflow-hidden z-10 pointer-events-none',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
    >
      <motion.div
        className={cn(
          'h-full w-full bg-linear-to-r',
          variantStyles[variant]
        )}
        style={{
          backgroundSize: '400% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '400% 50%'],
        }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
    </div>
  );
}