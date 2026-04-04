/**
 * @file apps/portfolio-web/src/app/[lang]/not-found.tsx
 * @description Paracaídas de error 404 localizado.
 */
import React from 'react';
import Link from 'next/link';

export default function LocalizedNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="font-display text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-zinc-400 mb-8">Página no encontrada.</p>
      <Link href="/" className="px-8 py-3 bg-primary text-white rounded-full">
        Volver al inicio
      </Link>
    </div>
  );
}