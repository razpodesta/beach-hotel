/**
 * @file packages/identity-gateway/src/ui/SocialLogin.tsx
 * @description Cluster de acceso social de alta fidelidad. 
 *              Implementa botones tácticos con branding inmersivo y 
 *              efectos de profundidad visual.
 * @version 1.0 - Luxury OAuth Interface
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { motion } from 'framer-motion';
import { FaGoogle, FaApple, FaFacebookF } from 'react-icons/fa';
import { cn } from '../utils/cn';
import type { IdentityDictionary } from '../schemas/auth.schema';

interface SocialLoginProps {
  dictionary: IdentityDictionary;
  onProviderClick: (provider: 'google' | 'apple' | 'facebook') => void;
  disabled?: boolean;
}

/**
 * APARATO: SocialLogin
 * @description Orquesta la entrada vía proveedores OAuth con estética boutique.
 */
export function SocialLogin({ dictionary, onProviderClick, disabled }: SocialLoginProps) {
  
  const providers = [
    { id: 'google' as const, icon: FaGoogle, color: 'hover:text-[#4285F4]', glow: 'hover:shadow-[#4285F4]/10', label: dictionary.google_label },
    { id: 'apple' as const, icon: FaApple, color: 'hover:text-foreground', glow: 'hover:shadow-foreground/10', label: dictionary.apple_label },
    { id: 'facebook' as const, icon: FaFacebookF, color: 'hover:text-[#1877F2]', glow: 'hover:shadow-[#1877F2]/10', label: dictionary.facebook_label },
  ];

  return (
    <div className="space-y-6">
      {/* DIVISOR EDITORIAL */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-4 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            {dictionary.email_divider}
          </span>
        </div>
      </div>

      {/* GRID DE PROVEEDORES (High Fidelity Buttons) */}
      <div className="grid grid-cols-3 gap-4">
        {providers.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onProviderClick(p.id)}
            disabled={disabled}
            className={cn(
              "group relative flex h-16 items-center justify-center rounded-2xl border border-border/50 bg-background/40 transition-all duration-500",
              "hover:border-primary/30 hover:bg-surface shadow-lg",
              p.glow,
              disabled && "opacity-40 cursor-not-allowed grayscale"
            )}
            aria-label={p.label}
          >
            {/* Resplandor de fondo adaptativo */}
            <div className={cn(
               "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity",
               p.id === 'google' ? 'bg-[#4285F4]' : p.id === 'apple' ? 'bg-foreground' : 'bg-[#1877F2]'
            )} />
            
            <p.icon 
              size={20} 
              className={cn("relative z-10 text-muted-foreground transition-colors duration-500", p.color)} 
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}