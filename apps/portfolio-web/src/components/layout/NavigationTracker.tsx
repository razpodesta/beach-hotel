// RUTA: apps/portfolio-web/src/components/layout/NavigationTracker.tsx
// VERSIÓN: 1.0 - Rastreo de Comportamiento "Hilo de Ariadna"
// DESCRIPCIÓN: Componente silencioso que registra el historial de navegación.

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookie, setCookie } from 'cookies-next';

const HISTORY_COOKIE_NAME = 'raz_visitor_trace';
const MAX_HISTORY_LENGTH = 20;

export function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Usamos una ref para evitar disparos dobles en React Strict Mode
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Construimos la ruta completa (ej: /pt-BR/proyectos?ref=twitter)
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Evitamos duplicados consecutivos (ej: recargas o clicks dobles)
    if (url === lastTrackedPath.current) return;

    // Ignoramos rutas de sistema o assets que se hayan colado
    if (url.startsWith('/_next') || url.includes('/api/')) return;

    lastTrackedPath.current = url;

    try {
      // 1. Leer historial existente
      const existingCookie = getCookie(HISTORY_COOKIE_NAME);
      let history: string[] = [];

      if (existingCookie && typeof existingCookie === 'string') {
        try {
          history = JSON.parse(existingCookie);
        } catch {
          history = []; // Reset si está corrupta
        }
      }

      // 2. Añadir nueva ruta al inicio (Stack)
      // Formato: "TIMESTAMP|PATH" para tener metadata temporal ligera
      const entry = `${Date.now()}|${url}`;

      // Filtramos para no tener duplicados exactos recientes si se desea,
      // pero aquí permitimos re-visitas para ver patrones de bucle.
      const newHistory = [entry, ...history].slice(0, MAX_HISTORY_LENGTH);

      // 3. Guardar (Cookie de sesión o persistente por 30 días)
      setCookie(HISTORY_COOKIE_NAME, JSON.stringify(newHistory), {
        maxAge: 60 * 60 * 24 * 30, // 30 días
        path: '/',
        sameSite: 'lax',
      });

      // --- Opcional: Logging en Desarrollo ---
      if (process.env.NODE_ENV === 'development') {
        console.log('[🛡️ Ariadna Thread]', url);
      }

    } catch (error) {
      console.error('[Tracker Error]', error);
    }

  }, [pathname, searchParams]);

  return null; // Componente puramente lógico, no renderiza nada.
}
