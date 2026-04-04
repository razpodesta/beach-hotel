/**
 * @file apps/portfolio-web/src/app/layout.tsx
 * @description Root Layout Global. Define la estructura base obligatoria.
 *              Refactorizado: Purificación de rutas relativas para el motor SWC.
 * @version 1.1 - Sovereign Static Shell (Build Hardened)
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';

/**
 * @pilar V: Adherencia arquitectónica.
 * Corrección de la ruta relativa del motor de estilos Oxygen.
 */
import './global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Nota: La clase 'scroll-smooth' y los data-attributes se gestionan aquí
  // para asegurar que el motor de temas de next-themes funcione globalmente.
  return (
    <html lang="pt-BR" suppressHydrationWarning className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}