/**
 * @file apps/portfolio-web/src/app/[lang]/not-found.tsx
 * @description Paracaídas de error 404 localizado (Sovereign i18n Edition).
 *              Refactorizado: Determinismo de idioma mediante extracción de headers,
 *              sincronización con SSoT de diccionarios y Oxygen UI v4.
 * 
 * @version 6.0 - Deterministic Locale & Oxygen v4 Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { MoveLeft, ShieldAlert, Compass } from 'lucide-react';

/** 
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe)
 * @pilar V: Adherencia Arquitectónica.
 */
import { getDictionary } from '../../lib/get-dictionary';
import { i18n, type Locale, isValidLocale } from '../../config/i18n.config';
import { BlurText } from '../../components/razBits/BlurText';
import { cn } from '../../lib/utils/cn';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5
 */
const C = {
  reset: '\x1b[0m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * APARATO: LocalizedNotFound
 * @description Resuelve el error 404 dentro de un segmento [lang] validado.
 */
export default async function LocalizedNotFound() {
  /**
   * 1. RESOLUCIÓN DE CONTEXTO DETERMINISTA
   * Extraemos el idioma del path de la petición para evitar Hydration Mismatch.
   */
  const headerList = await headers();
  const fullPath = headerList.get('x-url') || headerList.get('referer') || '';
  
  // Intentamos extraer el locale del path (ej: /es-ES/...)
  const segments = new URL(fullPath, 'http://localhost').pathname.split('/').filter(Boolean);
  const detectedLocale = segments[0] && isValidLocale(segments[0]) 
    ? (segments[0] as Locale) 
    : i18n.defaultLocale;

  // 2. SINCRONIZACIÓN SSoT (MACS Engine)
  const dictionary = await getDictionary(detectedLocale);
  const t = dictionary.not_found;

  /**
   * TELEMETRÍA FORENSE (Heimdall Alert)
   */
  console.warn(
    `${C.magenta}${C.bold}[DNA][ROUTING]${C.reset} ${C.yellow}Localized 404 detected${C.reset} | ` +
    `Perimeter: ${C.cyan}${detectedLocale}${C.reset} | Path: ${fullPath}`
  );

  return (
    <main 
      className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-6 text-center overflow-hidden bg-background transition-colors duration-1000"
      aria-labelledby="not-found-title"
    >
      {/* CAPA ATMOSFÉRICA (Glow Adaptativo OKLCH) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] pointer-events-none opacity-[0.04]" />
      
      <div className="relative z-10 space-y-12 max-w-2xl">
        
        {/* INDICADOR TÉCNICO DE PERÍMETRO */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-surface border border-border shadow-luxury transition-all duration-700 hover:border-primary/30">
            <ShieldAlert size={16} className="text-primary animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-foreground/60">
              {t.error_code}
            </span>
          </div>
        </div>

        {/* NARRATIVA DE ERROR (Oxygen Engine) */}
        <div className="space-y-6">
          <BlurText 
            text={t.title.toUpperCase()} 
            className="font-display text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground justify-center drop-shadow-2xl"
            delay={50}
            animateBy="letters"
          />
          
          <p className="text-lg md:text-2xl text-muted-foreground font-sans font-light italic leading-relaxed max-w-lg mx-auto">
            {t.description}
          </p>
        </div>

        {/* ACCIÓN DE REINSERCIÓN SOBERANA */}
        <div className="pt-8">
          <Link 
            href={`/${detectedLocale}`}
            className={cn(
              "group relative inline-flex items-center gap-6 rounded-full px-12 py-6 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-500 active:scale-95 shadow-3xl",
              "bg-foreground text-background hover:bg-primary hover:text-white"
            )}
          >
            <MoveLeft size={18} className="transition-transform group-hover:-translate-x-3 duration-500" />
            {t.cta_button}
          </Link>
        </div>
      </div>

      {/* ARTEFACTO DE FONDO: COMPASS (Inertial Decor) */}
      <div className="absolute -bottom-24 -right-24 opacity-[0.03] pointer-events-none rotate-12 select-none">
        <Compass size={700} strokeWidth={0.5} className="text-foreground" />
      </div>

      {/* FOOTER TELEMÉTRICO */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-50 transition-opacity">
         <span className="text-[8px] font-mono uppercase tracking-[0.8em] text-muted-foreground">
           Node: Sanctuary_{detectedLocale.toUpperCase()} • Trace: ACTIVE
         </span>
      </div>
    </main>
  );
}