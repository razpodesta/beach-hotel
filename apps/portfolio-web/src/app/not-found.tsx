/**
 * @file apps/portfolio-web/src/app/not-found.tsx
 * @description Paracaídas de error 404 global absoluto (Root Level).
 *              Refactorizado: Inyección del Shell HTML Soberano (<html> y <body>)
 *              para cumplir con la directiva estricta de Next.js 15 y evitar el
 *              fallback al Pages Router que colisiona con Payload CMS.
 * @version 3.0 - Sovereign HTML Shell Shield
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import Link from 'next/link';
import { fontVariables } from '../lib/fonts';
import './global.css';

export default function RootNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center transition-colors duration-1000">
          <div className="space-y-6">
            <h1 className="font-display text-8xl md:text-9xl font-bold text-primary tracking-tighter drop-shadow-2xl">
              404
            </h1>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.4em] text-muted-foreground">
                Perímetro No Encontrado
              </h2>
              <p className="text-sm font-light text-muted-foreground/60 italic max-w-md mx-auto leading-relaxed">
                The requested coordinate does not exist in the current spatial perimeter.
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <Link 
              href="/pt-BR" 
              className="group relative inline-flex items-center gap-4 rounded-full px-10 py-5 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-2xl active:scale-95 bg-foreground text-background hover:bg-primary hover:text-white"
            >
              Return to Sanctuary
            </Link>
          </div>

          {/* Artefacto de profundidad visual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        </main>
      </body>
    </html>
  );
}