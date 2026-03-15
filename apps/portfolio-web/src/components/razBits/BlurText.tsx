/**
 * @file apps/portfolio-web/src/components/razBits/BlurText.tsx
 * @description Componente de texto animado con desenfoque.
 *              Refactorizado para Build-Safety (SSR compliant) y Linter Compliant.
 * @version 1.3 - Linter Clean
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { motion, type Transition } from 'framer-motion';
import { useEffect, useRef, useState, useMemo, useCallback, useSyncExternalStore } from 'react';

type BlurTextProps = {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
};

// Hook para detectar montaje seguro (Linter-compliant)
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => {
      // Intencionalmente vacío: Estado de montaje estático en cliente.
      // Comentario necesario para satisfacer la regla 'no-empty-function' de ESLint.
    };
  }, []);

  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function BlurText({
  text = '',
  delay = 150,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
}: BlurTextProps) {
  const isMounted = useIsMounted();
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMounted || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isMounted]);

  const elements = useMemo(
    () => (animateBy === 'words' ? text.split(' ') : text.split('')),
    [text, animateBy]
  );

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
          duration: 0.5,
          delay: index * (delay / 1000),
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
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </div>
  );
}