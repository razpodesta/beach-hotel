/**
 * @file packages/identity-gateway/src/ui/SocialLogin.tsx
 * @description Cluster de acceso social de alta fidelidad (OAuth Node). 
 *              Implementa botones tácticos con estados de carga atómicos
 *              y efectos de resplandor cinemático.
 *              Refactorizado: Optimización de inercia visual y blindaje 
 *              contra Race Conditions durante el handshake.
 * @version 2.1 - Social Handshake Hardened
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import type { IdentityDictionary } from '../schemas/auth.schema';

/**
 * @interface SocialLoginProps
 * @pilar III: Seguridad de Tipos Absoluta.
 */
interface SocialLoginProps {
  /** Diccionario nivelado de identidad */
  dictionary: IdentityDictionary;
  /** 
   * Handler de despacho. 
   * Debe devolver una promesa para gestionar el bloqueo visual del nodo. 
   */
  onProviderClick: (provider: 'google' | 'apple') => Promise<void>;
  /** Estado de carga global o bloqueo por infraestructura externa */
  disabled?: boolean;
}

/**
 * APARATO: SocialLogin
 * @description Orquesta la entrada vía proveedores OAuth con estética boutique MetaShark.
 */
export function SocialLogin({ dictionary, onProviderClick, disabled }: SocialLoginProps) {
  // Estado local para feedback granular (Pilar XII - MEA/UX)
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  const providers = [
    { 
      id: 'google' as const, 
      icon: FaGoogle, 
      brandColor: '#4285F4',
      label: dictionary.google_label 
    },
    { 
      id: 'apple' as const, 
      icon: FaApple, 
      brandColor: 'var(--color-foreground)',
      label: dictionary.apple_label 
    },
  ];

  /**
   * @function handleTrigger
   * @description Gestiona el ciclo de vida del clic social con telemetría Heimdall.
   * @pilar X: Performance - Evita múltiples ejecuciones simultáneas.
   */
  const handleTrigger = useCallback(async (provider: 'google' | 'apple') => {
    if (disabled || loadingProvider) return;

    setLoadingProvider(provider);
    
    /** @pilar IV: Observabilidad DNA-Level */
    console.log(`[HEIMDALL][AUTH] Initiating ${provider.toUpperCase()} Identity Link.`);
    
    try {
      await onProviderClick(provider);
    } catch (err: unknown) {
      /** @pilar VIII: Resiliencia - Liberación del nodo en caso de fallo de red */
      const msg = err instanceof Error ? err.message : 'Unknown OAuth Error';
      console.warn(`[HEIMDALL][AUTH] Handshake failed for ${provider}: ${msg}`);
      setLoadingProvider(null);
    }
  }, [disabled, loadingProvider, onProviderClick]);

  return (
    <div className="space-y-6">
      {/* DIVISOR EDITORIAL SOBERANO */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-6 font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50">
            {dictionary.email_divider}
          </span>
        </div>
      </div>

      {/* GRID DE PROVEEDORES (Boutique High-Fidelity) */}
      <div className="grid grid-cols-2 gap-4">
        {providers.map((p) => {
          const isLoading = loadingProvider === p.id;
          const isOtherLoading = loadingProvider !== null && !isLoading;
          const Icon = p.icon;

          return (
            <motion.button
              key={p.id}
              layout
              whileHover={!(disabled || loadingProvider) ? { y: -4, scale: 1.02 } : {}}
              whileTap={!(disabled || loadingProvider) ? { scale: 0.98 } : {}}
              onClick={() => handleTrigger(p.id)}
              disabled={disabled || loadingProvider !== null}
              className={cn(
                "group relative flex h-16 items-center justify-center rounded-2xl border transition-all duration-500 transform-gpu",
                "bg-background/40 border-border/50 shadow-lg",
                "hover:border-primary/30 hover:bg-surface",
                (disabled || isOtherLoading) && "opacity-40 grayscale cursor-not-allowed",
                isLoading && "border-primary/50 bg-primary/5 cursor-wait shadow-primary/10"
              )}
              aria-label={p.label}
              title={p.label}
            >
              {/* CAPA DE RESPLANDOR ADAPTATIVO (MEA/UX) */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-[0.04] transition-opacity duration-700"
                style={{ backgroundColor: p.brandColor }}
              />
              
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 size={22} className="text-primary animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 text-muted-foreground group-hover:text-foreground transition-colors duration-500"
                  >
                    <Icon size={22} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Indicador de Handshake Activo (Efecto de Latido) */}
              {isLoading && (
                <motion.div 
                  layoutId="active-provider-glow"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full blur-[2px] animate-pulse"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}