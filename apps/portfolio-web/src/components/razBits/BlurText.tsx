// RUTA: apps/portfolio-web/src/components/razBits/BlurText.tsx
// VERSIÓN: 1.1 - Corrección de Sintaxis de Tipo de Función.
// DESCRIPCIÓN: Se ha corregido un error de sintaxis en la definición del tipo
//              `onAnimationComplete`. La sintaxis incorrecta `() as void => void`
//              ha sido reemplazada por la forma canónica y correcta en TypeScript:
//              `() => void`, resolviendo el error de compilación.

'use client';

import { motion, type Transition } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

/**
 * Define las propiedades configurables para el componente BlurText.
 */
type BlurTextProps = {
  /** El texto que se va a animar. */
  text: string;
  /** El retardo en milisegundos entre la animación de cada palabra o letra. */
  delay?: number;
  /** Clases de Tailwind CSS para aplicar estilo al contenedor. */
  className?: string;
  /** Determina si la animación se aplica a 'words' (palabras) o 'letters' (letras). */
  animateBy?: 'words' | 'letters';
  /** La dirección desde la que aparece el texto ('top' o 'bottom'). */
  direction?: 'top' | 'bottom';
  /** Función a ejecutar cuando la animación completa ha terminado. */
  // --- INICIO DE LA CORRECCIÓN DE SINTAXIS ---
  onAnimationComplete?: () => void;
  // --- FIN DE LA CORRECCIÓN DE SINTAXIS ---
};

/**
 * Componente que renderiza texto con una animación de desenfoque al entrar en el viewport.
 */
export function BlurText({
  text = '',
  delay = 150,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
}: BlurTextProps) {
  const elements = useMemo(
    () => (animateBy === 'words' ? text.split(' ') : text.split('')),
    [text, animateBy]
  );

  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const animationVariants = useMemo(() => ({
    hidden: {
      filter: 'blur(10px)',
      opacity: 0,
      y: direction === 'top' ? -50 : 50,
    },
    visible: {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
    },
  }), [direction]);

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {elements.map((segment, index) => {
        const transition: Transition = {
          duration: 0.5, // Duración de la animación para cada segmento
          delay: index * (delay / 1000), // Retardo escalonado
          ease: 'easeOut',
        };

        return (
          <motion.span
            key={index}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={animationVariants}
            transition={transition}
            onAnimationComplete={() => {
              if (index === elements.length - 1 && onAnimationComplete) {
                onAnimationComplete();
              }
            }}
            style={{ display: 'inline-block' }}
          >
            {/* Se usa un non-breaking space para los espacios en blanco */}
            {segment === ' ' ? '\u00A0' : segment}
            {/* Se añade un espacio después de cada palabra para mantener el flujo del texto */}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </div>
  );
}
