/**
 * @file apps/portfolio-web/src/app/global-error.tsx
 * @description Paracaídas de error 500 global (Sovereign Recovery Node).
 *              Actúa como la frontera final ante fallos catastróficos del sistema.
 *              Refactorizado: Erradicación de renderizado en cascada (React 19),
 *              sincronización con el SSoT de diccionarios, notación canónica OKLCH
 *              y resolución de infracción por función vacía en el linter.
 * @version 2.2 - Linter Pure & Atomic Hydration
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { RefreshCcw, ShieldAlert, Home, Terminal } from 'lucide-react';
import { getCookie } from 'cookies-next';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { fontVariables } from '../lib/fonts';
import { cn } from '../lib/utils/cn';
import './global.css';

/** 
 * DICCIONARIO DE EMERGENCIA (Fail-Safe Local)
 * @description Copia estática mínima para garantizar operatividad si el sistema I/O falla.
 */
const RECOVERY_MAP = {
  'pt-BR': {
    title: 'Anomalia no Núcleo',
    description: 'Detectamos uma instabilidade crítica na infraestrutura. Nossas sentinelas já foram notificadas.',
    retry: 'Reinicializar Nodo',
    home: 'Evacuação de Emergência'
  },
  'en-US': {
    title: 'Core Anomaly',
    description: 'A critical infrastructure instability has been detected. Our sentinels have been notified.',
    retry: 'Reinitialize Node',
    home: 'Emergency Evacuation'
  },
  'es-ES': {
    title: 'Anomalía en el Núcleo',
    description: 'Detectamos una inestabilidad crítica en la infraestructura. Nuestros centinelas han sido notificados.',
    retry: 'Reinicializar Nodo',
    home: 'Evacuación de Emergencia'
  }
};

/**
 * Hook de Hidratación de Élite: useIsMounted
 * @pilar X: Performance - Evita cascada de renders al usar la API de suscripción de React 19.
 * @fix TS-Lint: Se añade comentario interno para evitar el error 'no-empty-function'.
 */
function useIsMounted(): boolean {
  const subscribe = useCallback(() => {
    return () => {
      /* No-op: Estado estático en cliente para el paracaídas de error */
    };
  }, []);
  
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * APARATO: GlobalError
 * @description Límite de error raíz. Reemplaza el Root Layout durante el fallo catastrófico.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isMounted = useIsMounted();

  /**
   * 1. RESOLUCIÓN DE IDIOMA (Client-Side Detection)
   * Prioridad: Cookie 'NEXT_LOCALE' -> Browser Language -> Default (pt-BR)
   */
  const lang = useMemo(() => {
    if (typeof window === 'undefined') return 'pt-BR';
    const cookieLocale = getCookie('NEXT_LOCALE') as string;
    if (cookieLocale && RECOVERY_MAP[cookieLocale as keyof typeof RECOVERY_MAP]) return cookieLocale;
    
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en') return 'en-US';
    if (browserLang === 'es') return 'es-ES';
    
    return 'pt-BR';
  }, []);

  const t = RECOVERY_MAP[lang as keyof typeof RECOVERY_MAP] || RECOVERY_MAP['pt-BR'];

  /**
   * 2. PROTOCOLO HEIMDALL: Registro Forense de Desplome
   */
  useEffect(() => {
    if (!isMounted) return;
    const traceId = `err_500_${Date.now().toString(36).toUpperCase()}`;
    
    console.group(`%c[HEIMDALL][FATAL] Core Anomaly Detected`, 'color: #ff0000; font-weight: bold;');
    console.error(`Message: ${error.message}`);
    console.error(`Digest: ${error.digest || 'NO_DIGEST_PROVIDED'}`);
    console.error(`Trace_ID: ${traceId}`);
    console.groupEnd();
  }, [error, isMounted]);

  /**
   * 3. ACCIÓN DE EVACUACIÓN
   */
  const handleEvacuation = useCallback(() => {
    window.location.href = `/${lang}`;
  }, [lang]);

  // Guardia de Hidratación para prevenir discrepancias en las etiquetas <html>/<body>
  if (!isMounted) return null;

  return (
    <html lang={lang.split('-')[0]} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center overflow-hidden">
          
          {/* ARTEFACTO ATMOSFÉRICO DE CRISIS (MEA/UX) 
              @fix: Sintaxis canónica OKLCH según recomendación del analizador.
          */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(60%_0.2_20/0.08),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-12 max-w-2xl">
            
            {/* INDICADOR DE BRECHA */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
                <ShieldAlert size={80} className="text-red-500 relative" strokeWidth={1.2} />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-foreground drop-shadow-2xl">
                500
              </h1>
              
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.4em] text-foreground/90">
                  {t.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground font-sans font-light italic leading-relaxed max-w-md mx-auto">
                  {t.description}
                </p>
              </div>
            </div>

            {/* CONSOLA DE ACCIÓN TÁCTICA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button 
                onClick={() => reset()}
                className={cn(
                  "group flex items-center gap-3 rounded-full bg-foreground px-10 py-5 text-[10px] font-bold uppercase tracking-[0.4em] text-background",
                  "hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl active:scale-95"
                )}
              >
                <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                {t.retry}
              </button>

              <button 
                onClick={handleEvacuation}
                className={cn(
                  "flex items-center gap-3 rounded-full border border-border px-10 py-5 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground",
                  "hover:bg-surface hover:text-foreground transition-all duration-500 active:scale-95"
                )}
              >
                <Home size={14} />
                {t.home}
              </button>
            </div>

            {/* TELEMETRÍA DE SEGURIDAD (Audit Trail) */}
            <div className="pt-12 flex flex-col items-center gap-3 opacity-30">
               <div className="flex items-center gap-3 font-mono text-[8px] uppercase tracking-widest">
                  <Terminal size={12} />
                  <span>Digest: {error.digest || 'L0_CORE_DRIFT'}</span>
               </div>
               <p className="text-[7px] font-mono uppercase tracking-[0.6em]">
                  Sovereign Recovery Protocol v2.2
               </p>
            </div>

          </div>
        </main>
      </body>
    </html>
  );
}