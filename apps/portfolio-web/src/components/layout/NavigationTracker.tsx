/**
 * @file apps/portfolio-web/src/components/layout/NavigationTracker.tsx
 * @description Rastreador de Comportamiento (Hilo de Ariadna).
 *              Refactorizado para Build-Safety: evita escrituras y acceso a cookies en SSR.
 * @version 2.1 - Build-Safe Persistence
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getCookie, setCookie } from 'cookies-next';

const HISTORY_COOKIE_NAME = 'raz_visitor_trace';
const MAX_HISTORY_LENGTH = 20;

export function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // @pilar VIII: Guardia de entorno. 
    // Aseguramos que el tracking solo ocurra en el navegador.
    if (typeof window === 'undefined') return;

    const searchString = searchParams.toString();
    const url = `${pathname}${searchString ? `?${searchString}` : ''}`;

    if (url === lastTrackedPath.current) return;

    // Filtros de exclusión de sistema
    if (url.startsWith('/_next') || url.startsWith('/api') || url.startsWith('/admin')) {
      return;
    }

    lastTrackedPath.current = url;

    const trackNavigation = async () => {
      try {
        const existingCookie = getCookie(HISTORY_COOKIE_NAME);
        let history: string[] = [];

        if (existingCookie && typeof existingCookie === 'string') {
          try {
            history = JSON.parse(existingCookie);
          } catch {
            history = [];
          }
        }

        const entry = `${Date.now()}|${url}`;
        const newHistory = [entry, ...history].slice(0, MAX_HISTORY_LENGTH);

        setCookie(HISTORY_COOKIE_NAME, JSON.stringify(newHistory), {
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      } catch {
        // Fallback silencioso para garantizar que no rompa el hilo de ejecución principal.
      }
    };

    queueMicrotask(trackNavigation);
  }, [pathname, searchParams]);

  return null;
}