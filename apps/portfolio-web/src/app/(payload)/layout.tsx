/**
 * @file apps/portfolio-web/src/app/(payload)/layout.tsx
 * @description Layout cautivo para el CMS. Bloquea la salida al router legacy.
 */
import React from 'react';

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}