// RUTA: apps/portfolio-web/src/components/layout/NavigationTracker.tsx

/**
 * @file Rastreador de Comportamiento (Hilo de Ariadna)
 * @version 2.0 - Async & Debounced Persistence
 * @description Rastrea la navegación del usuario de forma no bloqueante.
 *              Utiliza una lógica de 'batching' para evitar escrituras excesivas 
 *              en el almacenamiento.
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
    // 1. Normalización de la ruta completa
    const searchString = searchParams.toString();
    const url = `${pathname}${searchString ? `?${searchString}` : ''}`;

    // 2. Guardián de duplicados inmediatos
    if (url === lastTrackedPath.current) return;

    // 3. Exclusión de rutas de sistema (filtro rápido)
    if (url.startsWith('/_next') || url.startsWith('/api') || url.startsWith('/admin')) {
      return;
    }

    lastTrackedPath.current = url;

    // 4. Ejecución asíncrona para no bloquear el renderizado del frame
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

        // Nueva entrada con timestamp preciso
        const entry = `${Date.now()}|${url}`;
        const newHistory = [entry, ...history].slice(0, MAX_HISTORY_LENGTH);

        // Persistencia con configuración de seguridad
        setCookie(HISTORY_COOKIE_NAME, JSON.stringify(newHistory), {
          maxAge: 60 * 60 * 24 * 30, // 30 días
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

      } catch (error) {
        // Logging silencioso en producción para no ensuciar logs de usuario
        if (process.env.NODE_ENV === 'development') {
          console.error('[Ariadna Tracker] Error en persistencia:', error);
        }
      }
    };

    // Micro-tarea para asegurar que el tracking ocurra después de la navegación
    queueMicrotask(trackNavigation);

  }, [pathname, searchParams]);

  return null;
}