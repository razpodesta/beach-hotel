// RUTA: apps/portfolio-web/src/components/ui/PrintButton.tsx

/**
 * @file Botón de Acción de Impresión
 * @version 2.0 - Soberano, Accesible & Estilizado
 * @description Botón flotante para impresión de documentos. Implementa `cn()` 
 *              y validación de entorno, ocultándose automáticamente mediante 
 *              media queries de impresión.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export interface PrintButtonProps {
  /** Texto del botón para accesibilidad y UI. */
  text: string;
  className?: string;
}

/**
 * Renderiza un botón flotante soberano para activar la impresión del documento.
 * Se oculta automáticamente cuando el usuario inicia el diálogo de impresión.
 */
export function PrintButton({ text, className }: PrintButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // No renderizamos nada hasta estar en el cliente para evitar hidratación fallida
  if (!isClient) return null;

  return (
    <button
      onClick={() => window.print()}
      className={cn(
        // 'print:hidden' es la directriz clave para ocultar este botón en papel
        'print:hidden fixed bottom-8 right-8 z-50 flex items-center gap-3',
        'rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-2xl',
        'transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20 active:scale-95',
        className
      )}
      aria-label={text}
    >
      <Printer size={18} />
      <span>{text}</span>
    </button>
  );
}