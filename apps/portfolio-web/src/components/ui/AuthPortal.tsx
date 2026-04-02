/**
 * @file AuthPortal.tsx
 * @description Orquestador de Autenticación de Élite. 
 *              Refactorizado: Conciencia contextual (Edge Gating Sync),
 *              resolución estricta de React 19 (useState + rAF),
 *              higiene TS7030, y corrección de importaciones (cn).
 * @version 2.3 - Flawless React 19 Standard
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, ShieldCheck, Sparkles, 
  Chrome, Apple, Facebook, ShieldAlert 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA
 */
import { useUIStore } from '../../lib/store/ui.store';
import { supabase } from '../../lib/supabase/client';
import { cn } from '../../lib/utils/cn';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';

interface AuthPortalProps {
  /** Diccionario nivelado (MACS compliance) */
  dictionary: Dictionary['auth_portal'];
}

export function AuthPortal({ dictionary }: AuthPortalProps) {
  const { isAuthModalOpen, closeAuthModal, toggleAuthModal, session } = useUIStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * @pilar_X: Rendimiento de Élite (Safe State Updates).
   * Utilizamos useState para reactividad pura en React 19.
   * La cascada de renders se evita delegando la actualización a rAF.
   */
  const [wasRedirected, setWasRedirected] = useState(false);

  /**
   * PROTOCOLO HEIMDALL: Intercepción de Redirección (Edge Gating Sync)
   * @description Escucha la señal '?auth=required' inyectada por el middleware.
   */
  useEffect(() => {
    const isAuthRequired = searchParams?.get('auth') === 'required';

    if (isAuthRequired && !session) {
      console.log('[HEIMDALL][UX] Edge rejection detected. Triggering Auth Portal.');
      
      // Diferimos la mutación de estado para prevenir el error 'set-state-in-effect'
      requestAnimationFrame(() => {
        setWasRedirected(true);
        if (!isAuthModalOpen) {
          toggleAuthModal();
        }
      });

      // Limpieza forense de la URL (sin recargar la vista)
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('auth');
      const queryString = params.toString();
      const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
      
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, session, isAuthModalOpen, toggleAuthModal, pathname, router]);

  /**
   * @fix TS7030: Flujo incondicional de limpieza.
   * Garantiza que el efecto devuelva siempre una función.
   */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (!isAuthModalOpen && wasRedirected) {
      timer = setTimeout(() => {
        setWasRedirected(false);
      }, 500);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthModalOpen, wasRedirected]);

  /**
   * HANDLER: Protocolo OAuth Soberano
   */
  const handleOAuthLogin = useCallback(async (provider: 'google' | 'apple' | 'facebook') => {
    console.log(`[HEIMDALL][AUTH] Initiating ${provider.toUpperCase()} Handshake...`);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) console.error(`[AUTH_ERR] ${error.message}`);
  }, []);

  if (!isAuthModalOpen || session) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-110 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* BACKDROP: Sanctuary Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
        />

        {/* PORTAL CORE */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md overflow-hidden rounded-[3.5rem] border border-border bg-surface shadow-3xl flex flex-col"
        >
          {/* HEADER: Identidad Progresiva y Conciencia Contextual */}
          <header className="p-10 pb-6 text-center">
            <button
              onClick={closeAuthModal}
              className="absolute right-8 top-8 p-2 rounded-full bg-background/50 text-muted-foreground hover:text-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Cerrar portal de autenticación"
            >
              <X size={20} />
            </button>

            {wasRedirected ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 uppercase tracking-[0.4em] mb-6"
              >
                <ShieldAlert size={12} className="animate-pulse" />
                Zona Restringida
              </motion.div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-6">
                <Sparkles size={12} className="animate-pulse" />
                Acceso Soberano
              </div>
            )}

            <h2 id="auth-modal-title" className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tighter leading-none mb-4">
              {dictionary.title_join}
            </h2>
            <p className="text-muted-foreground text-sm font-sans font-light italic">
              {wasRedirected 
                ? "Requerimos validar su identidad para acceder a este perímetro." 
                : dictionary.subtitle}
            </p>
          </header>

          {/* ACCIONES OAUTH: Jerarquía de Élite */}
          <div className="px-10 pb-8 space-y-3">
            <button
              onClick={() => handleOAuthLogin('apple')}
              className="w-full flex items-center justify-between px-8 py-5 rounded-2xl bg-black text-white hover:bg-zinc-900 transition-all group shadow-xl active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Apple size={20} fill="currentColor" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{dictionary.apple_label}</span>
              <div className="w-5" />
            </button>

            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-between px-8 py-5 rounded-2xl bg-white border border-border text-black hover:bg-zinc-50 transition-all shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Chrome size={20} className="text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{dictionary.google_label}</span>
              <div className="w-5" />
            </button>

            <button
              onClick={() => handleOAuthLogin('facebook')}
              className="w-full flex items-center justify-between px-8 py-5 rounded-2xl bg-[#1877F2] text-white hover:bg-[#166fe5] transition-all shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Facebook size={20} fill="currentColor" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{dictionary.facebook_label}</span>
              <div className="w-5" />
            </button>

            {/* DIVISOR: Email Minimalism */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
                <span className="bg-surface px-4 font-mono">{dictionary.email_divider}</span>
              </div>
            </div>

            {/* Entrada de Email */}
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder={dictionary.email_placeholder}
                className="w-full bg-background/40 border border-border/50 rounded-xl py-4 px-6 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 text-foreground"
              />
              <button className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
                <Mail size={14} />
                {dictionary.email_cta}
              </button>
            </div>
          </div>

          {/* FOOTER: Trust & Compliance */}
          <footer className="p-8 bg-background/30 border-t border-border/40 text-center space-y-4">
             <div className="flex items-center justify-center gap-3 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-success" />
                {dictionary.footer_trust}
             </div>
             <p className="text-[8px] text-muted-foreground/40 leading-relaxed max-w-[200px] mx-auto uppercase tracking-tighter">
                {dictionary.privacy_notice}
             </p>
          </footer>

          {/* Resplandor Adaptativo */}
          <div 
            className={cn(
              "absolute -bottom-16 -right-16 h-48 w-48 rounded-full blur-3xl pointer-events-none transition-colors duration-1000",
              wasRedirected ? "bg-red-500/10" : "bg-primary/5"
            )} 
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}