/**
 * @file AuthPortal.tsx
 * @description Identity Fortress - Orquestador de Autenticación de Élite.
 *              Refactorizado: Resolución de TS2305 (Action export sync), 
 *              limpieza de imports y telemetría DNA.
 * @version 4.3 - Linter Pure & Boundary Compliant
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Chrome, Apple, Facebook } from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTURA Y CONTRATOS
 * @fix: Importación verificada para evitar TS2305.
 */
import { useUIStore } from '../../lib/store/ui.store';
import { supabase } from '../../lib/supabase/client';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import { EmailPasswordForm, type AuthCredentials } from './auth/EmailPasswordForm';
import { authenticateUserAction } from '../../lib/portal/actions/auth-security.actions';

interface AuthPortalProps {
  dictionary: Dictionary['auth_portal'];
}

type OAuthProvider = 'google' | 'apple' | 'facebook';

export function AuthPortal({ dictionary }: AuthPortalProps) {
  const { isAuthModalOpen, closeAuthModal, session, tenantId } = useUIStore();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleOAuthLogin = useCallback(async (provider: OAuthProvider) => {
    sessionStorage.setItem('auth_context', JSON.stringify({
        path: window.location.pathname,
        timestamp: Date.now()
    }));

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const handleLoginStart = useCallback(async (credentials: AuthCredentials & { recaptchaToken: string }) => {
    const traceId = `pwd_login_${Date.now().toString(36)}`;
    
    if (!credentials.email || !tenantId) return;

    // Invocación a la Server Action. TS no debería fallar ahora.
    const result = await authenticateUserAction({
        email: credentials.email,
        password: credentials.password || '',
        recaptchaToken: credentials.recaptchaToken,
        tenantId: tenantId
    });

    if (!result.success) {
        console.error(`[HEIMDALL][AUTH] ${traceId} Handshake Denied: ${result.error}`);
        return;
    }
    
    console.log(`[HEIMDALL][AUTH] ${traceId} Handshake Successful.`);
    closeAuthModal();
  }, [tenantId, closeAuthModal]);

  if (!isAuthModalOpen || session) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-110 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md overflow-hidden rounded-[3.5rem] border border-border bg-surface shadow-3xl flex flex-col"
        >
          <header className="p-10 pb-6 text-center">
            <button
              onClick={closeAuthModal}
              className="absolute right-8 top-8 p-2 rounded-full bg-background/50 text-muted-foreground hover:text-foreground transition-all outline-none"
            >
              <X size={20} />
            </button>
            <h2 className="font-display text-3xl font-bold text-foreground tracking-tighter leading-none mb-4">
              {dictionary.title_join}
            </h2>
          </header>

          <div className="px-10 pb-10">
            <EmailPasswordForm dictionary={dictionary} onLoginStart={handleLoginStart} />
            
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
                <span className="bg-surface px-4 font-mono">{dictionary.email_divider}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleOAuthLogin('google')} className="py-4 rounded-2xl bg-white border border-border flex justify-center hover:bg-zinc-50 transition-all shadow-lg">
                <Chrome size={20} className="text-primary" />
              </button>
              <button onClick={() => handleOAuthLogin('apple')} className="py-4 rounded-2xl bg-black text-white flex justify-center transition-all shadow-xl">
                <Apple size={20} fill="currentColor" />
              </button>
              <button onClick={() => handleOAuthLogin('facebook')} className="py-4 rounded-2xl bg-[#1877F2] text-white flex justify-center transition-all shadow-lg">
                <Facebook size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}