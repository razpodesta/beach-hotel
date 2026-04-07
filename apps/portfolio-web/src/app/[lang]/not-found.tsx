/**
 * @file apps/portfolio-web/src/app/[lang]/not-found.tsx
 * @description Paracaídas de error 404 localizado (Sovereign i18n Edition).
 *              Refactorizado: Detección dinámica de locale mediante headers,
 *              sincronización con SSoT de diccionarios e inyección de ADN Oxygen.
 *              Resuelve el error de hardcoding y eleva la experiencia estética.
 * @version 5.0 - i18n Aware & MEA/UX Optimized
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { MoveLeft, ShieldAlert, Compass } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { getDictionary } from '../../lib/get-dictionary';
import { i18n, type Locale, isValidLocale } from '../../config/i18n.config';
import { BlurText } from '../../components/razBits/BlurText';
import { cn } from '../../lib/utils/cn';

/**
 * APARATO: LocalizedNotFound
 * @description Orquesta la respuesta visual ante rumbos inexistentes dentro 
 *              de un perímetro de idioma validado.
 */
export default async function LocalizedNotFound() {
  /**
   * 1. RESOLUCIÓN DE CONTEXTO (Heimdall Detection)
   * En Next.js 15, not-found no recibe params. Extraemos el locale del path original.
   */
  const headersList = await headers();
  const fullPath = headersList.get('x-invoke-path') || '';
  const segments = fullPath.split('/').filter(Boolean);
  const detectedLocale = segments[0] && isValidLocale(segments[0]) 
    ? (segments[0] as Locale) 
    : i18n.defaultLocale;

  // 2. SINCRONIZACIÓN SSoT
  const dictionary = await getDictionary(detectedLocale);
  const t = dictionary.not_found;

  console.warn(`[HEIMDALL][ROUTING] Coordinate Drift: 404 detected in segment [${detectedLocale}] | Path: ${fullPath}`);

  return (
    <main 
      className="relative flex min-h-[90vh] w-full flex-col items-center justify-center px-6 text-center overflow-hidden bg-background"
      aria-labelledby="not-found-title"
    >
      {/* CAPA ATMOSFÉRICA (MEA/UX) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)] pointer-events-none opacity-[0.03]" />
      
      <div className="relative z-10 space-y-10 max-w-2xl">
        
        {/* INDICADOR TÉCNICO */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary animate-pulse">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.4em]">
              {t.error_code}
            </span>
          </div>
        </div>

        {/* NARRATIVA DE ERROR (Oxygen Engine) */}
        <div className="space-y-6">
          <BlurText 
            text={t.title.toUpperCase()} 
            className="font-display text-5xl md:text-8xl font-bold tracking-tighter text-foreground justify-center"
            delay={50}
            animateBy="letters"
          />
          
          <p className="text-lg md:text-xl text-muted-foreground font-sans font-light italic leading-relaxed">
            {t.description}
          </p>
        </div>

        {/* ACCIÓN DE RETORNO SOBERANA */}
        <div className="pt-10">
          <Link 
            href={`/${detectedLocale}`}
            className={cn(
              "group relative inline-flex items-center gap-6 rounded-full px-12 py-6 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500",
              "bg-foreground text-background hover:bg-primary hover:text-white shadow-2xl active:scale-95"
            )}
          >
            <MoveLeft size={16} className="transition-transform group-hover:-translate-x-2" />
            {t.cta_button}
          </Link>
        </div>
      </div>

      {/* ARTEFACTO DE FONDO: COMPASS DORMANT */}
      <div className="absolute bottom-[-10%] right-[-5%] opacity-[0.02] pointer-events-none rotate-12">
        <Compass size={600} strokeWidth={0.5} className="text-foreground" />
      </div>

      {/* FOOTER DE TRAZABILIDAD */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20">
         <span className="text-[8px] font-mono uppercase tracking-[0.8em] text-muted-foreground">
           Perimeter: {detectedLocale.toUpperCase()} • Forensic Link: ACTIVE
         </span>
      </div>
    </main>
  );
}