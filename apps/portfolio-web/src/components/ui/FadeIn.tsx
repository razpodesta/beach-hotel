// RUTA: apps/portfolio-web/src/components/ui/FadeIn.tsx

/**
 * @file Wrapper de Animación FadeIn Soberano
 * @version 2.0 - Performance & Accessibility Optimized
 * @description Envuelve contenido en una transición suave. 
 *              Implementa `viewport={{ once: true }}` para evitar re-animaciones 
 *              innecesarias y utiliza `cn()` para una gestión de estilos robusta.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number; // Nueva prop: Control granular del desplazamiento inicial
}

/**
 * Renderiza contenido con una animación de entrada tipo "fade-in" ascendente.
 * Optimizado para ser utilizado en secciones de página con scroll.
 */
export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  yOffset = 20 
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // Curva de easing 'out-expo' personalizada para un feel de élite
      }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}