/**
 * @file packages/identity-gateway/src/ui/AuthModal.tsx
 * @description Orquestador Supremo de Identidad (The Access Gateway). 
 *              Gestiona transiciones entre Login/Registro e integra el motor
 *              de redirección OAuth para proveedores externos.
 *              Refactorizado: Resolución de TS2322, integración de redirección
 *              física y blindaje de contexto de retorno (nextPath).
 * @version 2.0 - OAuth Redirect Ready & Type Contract Sealed
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { resolveIdentityDictionary } from '../i18n/index';
import { 
  type IdentityDictionary, 
  type IdentityUser, 
  type AuthCredentials 
} from '../schemas/auth.schema';
import { LoginForm } from './forms/LoginForm';
import { RegisterForm } from './forms/RegisterForm';
import { SocialLogin } from './SocialLogin';
import { 
  loginAction, 
  registerAction, 
  signInWithOAuthAction 
} from '../actions/server-auth';

/**
 * @interface AuthModalProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Callback para login exitoso por credenciales */
  onSuccess?: (user: IdentityUser) => void;
  /** Manejador de errores para feedback en el Host */
  onError?: (error: string) => void;
  /** Idioma activo del ecosistema */
  locale?: string;
  /** Rumbo de destino tras la autenticación (Silo context) */
  nextPath?: string;
  /** Sobrescritura de diccionarios desde el Host */
  dictionaryOverrides?: Partial<IdentityDictionary>;
  /** Vista inicial del portal */
  initialView?: 'login' | 'register';
}

/**
 * APARATO: AuthModal
 * @description Centro de mando para la orquestación de identidades soberanas.
 */
export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  locale = 'en-US',
  nextPath = '/portal',
  dictionaryOverrides,
  initialView = 'login'
}: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. SINCRONIZACIÓN DE CONTENIDO (MACS)
  const dict = useMemo(() => 
    resolveIdentityDictionary(locale, dictionaryOverrides), 
    [locale, dictionaryOverrides]
  );

  /**
   * 2. PROTOCOLO DE SEGURIDAD L0 (reCAPTCHA v3)
   * Inyecta dinámicamente el script de Google solo cuando el modal está activo.
   */
  useEffect(() => {
    if (!isOpen) return;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.warn('[HEIMDALL][SECURITY] reCAPTCHA Site Key not found in Perimeter.');
      return;
    }

    const scriptId = 'recaptcha-gateway-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  /**
   * HANDLER: handleSocialAuth
   * @description Inicia la negociación de redirección con el motor OAuth.
   * @fix TS2322: Ahora devuelve Promise<void> para SocialLogin.
   */
  const handleSocialAuth = useCallback(async (provider: 'google' | 'apple') => {
    const traceId = `oauth_hsk_${Date.now()}`;
    console.log(`[HEIMDALL][AUTH] Negotiating external link: ${provider.toUpperCase()}`);
    
    try {
      const result = await signInWithOAuthAction(provider, nextPath);
      
      if (result.success && result.data?.url) {
        /** 
         * @pilar IX: Redirección Soberana. 
         * Abandonamos el árbol de React para ir al flujo de autorización. 
         */
        window.location.href = result.data.url;
      } else {
        throw new Error(result.error || 'OAUTH_HANDSHAKE_FAILED');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CORE_AUTH_DRIFT';
      console.error(`[CRITICAL] OAuth Handshake Aborted | Trace: ${traceId} | Error: ${msg}`);
      onError?.(msg);
      // Re-lanzamos para que SocialLogin libere el spinner interno
      throw err;
    }
  }, [nextPath, onError]);

  /**
   * @function isIdentityUser
   * @description Type Guard para validar la integridad del nodo antes del despacho.
   */
  const isIdentityUser = (data: unknown): data is IdentityUser => {
    return typeof data === 'object' && data !== null && 'id' in data && 'email' in data;
  };

  /**
   * HANDLERS DE FORMULARIO (Credenciales Directas)
   */
  const handleLoginSubmit = async (credentials: AuthCredentials) => {
    setIsProcessing(true);
    try {
      const result = await loginAction(credentials);
      if (result.success && isIdentityUser(result.data)) {
        console.log(`[HEIMDALL][AUTH] Access Granted: ${result.data.email}`);
        onSuccess?.(result.data);
      } else {
        onError?.(result.error || 'AUTH_REJECTED');
      }
    } catch {
      onError?.('CORE_SYSTEM_DRIFT');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterSubmit = async (credentials: AuthCredentials) => {
    setIsProcessing(true);
    try {
      const result = await registerAction(credentials);
      if (result.success && isIdentityUser(result.data)) {
        console.log(`[HEIMDALL][AUTH] New Identity provisioned: ${result.data.email}`);
        onSuccess?.(result.data);
      } else {
        onError?.(result.error || 'REGISTRATION_REJECTED');
      }
    } catch {
      onError?.('CORE_SYSTEM_DRIFT');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-110 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[3.5rem] border border-border bg-surface shadow-3xl flex flex-col transform-gpu"
        >
          <header className="p-10 pb-6 text-center relative">
            <button
              onClick={onClose}
              className="absolute right-8 top-8 p-2.5 rounded-full bg-background/50 text-muted-foreground hover:text-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-luxury">
                 <ShieldCheck size={32} strokeWidth={1.5} className="animate-pulse" />
              </div>
            </div>

            <h2 className="font-display text-4xl font-bold text-foreground tracking-tighter leading-none mb-3">
              {view === 'login' ? dict.title_login : dict.title_join}
            </h2>
            <p className="text-muted-foreground text-sm font-light italic px-4">
              {dict.subtitle}
            </p>
          </header>

          <div className="px-10 pb-6">
            <AnimatePresence mode="wait">
              {view === 'login' ? (
                <LoginForm 
                  key="login-view"
                  dictionary={dict} 
                  onSubmit={handleLoginSubmit} 
                  isLoading={isProcessing} 
                />
              ) : (
                <RegisterForm 
                  key="register-view"
                  dictionary={dict} 
                  onSubmit={handleRegisterSubmit} 
                  isLoading={isProcessing} 
                />
              )}
            </AnimatePresence>

            <SocialLogin 
              dictionary={dict} 
              onProviderClick={handleSocialAuth} 
              disabled={isProcessing}
            />
          </div>

          <footer className="p-8 bg-foreground/2 border-t border-border/40 text-center">
             <button
               onClick={() => setView(view === 'login' ? 'register' : 'login')}
               className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-3 mx-auto outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-4 py-2"
             >
                <Sparkles size={14} className="text-primary animate-pulse" />
                {view === 'login' ? dict.title_join : dict.title_login}
             </button>
          </footer>

          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/5 blur-[100px] pointer-events-none transition-colors duration-1000" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}