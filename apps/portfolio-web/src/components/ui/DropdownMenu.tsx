// RUTA: apps/portfolio-web/src/components/ui/DropdownMenu.tsx

/**
 * @file Menú Desplegable (DropdownMenu)
 * @version 2.0 - Accesible, Semántico & Resiliente
 * @description Dropdown con soporte para hover/click, tokens semánticos (Tailwind v4)
 *              y atributos ARIA completos para cumplimiento WCAG.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils/cn';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] },
  },
};

export function DropdownMenu({ trigger, children, className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* El trigger recibe los atributos ARIA para accesibilidad */}
      <div 
        aria-haspopup="true" 
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute top-full right-0 mt-2 w-64 origin-top-right",
              "rounded-xl border border-border bg-card shadow-2xl z-50",
              "p-1 backdrop-blur-md"
            )}
            role="menu"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}