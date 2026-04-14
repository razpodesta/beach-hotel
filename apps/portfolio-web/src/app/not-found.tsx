/**
 * @file apps/portfolio-web/src/app/not-found.tsx
 * @description Atrapador de Vacíos Global (Digital Flow Recovery).
 *              Refactorizado: Redirección mediante Meta-Tag para eliminar 
 *              código inaccesible y garantizar compatibilidad con Next.js 15.
 * 
 * @version 2.1 - Clean AST & Edge Resilient
 * @author Staff Engineer - MetaShark Tech
 */

import { i18n } from '../config/i18n.config';
import { fontVariables } from '../lib/fonts';

/**
 * APARATO: GlobalNotFound
 * @description Provee un Shell de recuperación que reconduce al usuario 
 *              al Santuario de forma determinista sin bloquear el análisis del servidor.
 */
export default function GlobalNotFound() {
  const targetPath = `/${i18n.defaultLocale}`;

  return (
    <html lang={i18n.defaultLocale} className={fontVariables}>
      <head>
        {/* 
            REDIRECCIÓN SOBERANA (Pilar VIII)
            Utilizamos Meta-Refresh como paracaídas de última instancia. 
            Esto asegura que el flujo digital se recupere incluso si 
            los headers de redirección fallan en la CDN.
        */}
        <meta http-equiv="refresh" content={`0;url=${targetPath}`} />
        <title>Recovering Digital Flow | Beach Hotel</title>
      </head>
      <body className="bg-background text-foreground">
        <main className="flex h-screen w-full flex-col items-center justify-center p-6 text-center">
           <div className="space-y-4">
              <div className="h-1.5 w-48 bg-foreground/5 rounded-full overflow-hidden mx-auto">
                 <div className="h-full bg-primary animate-infinite-scroll w-1/2" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
                Synchronizing Perimeter...
              </p>
           </div>
        </main>
      </body>
    </html>
  );
}