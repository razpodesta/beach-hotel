/**
 * @file apps/portfolio-web/src/app/global-error.tsx
 * @description Paracaídas de error 500 global. 
 *              Erradica la dependencia de 'next/document' en rutas de error.
 * @version 1.1
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect } from 'react';
import { fontVariables } from '../lib/fonts';
import './global.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[HEIMDALL][CRITICAL] Anomaly caught:', error);
  }, [error]);

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <h1 className="text-8xl font-bold text-red-500 mb-8">500</h1>
          <h2 className="text-xl uppercase tracking-[0.4em] mb-4">Anomalía Crítica</h2>
          <button 
            onClick={() => reset()}
            className="mt-8 rounded-full bg-foreground px-10 py-5 text-xs font-bold uppercase text-background hover:bg-primary transition-all"
          >
            Reinitialize Node
          </button>
        </main>
      </body>
    </html>
  );
}