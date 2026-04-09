/**
 * @file packages/identity-gateway/src/ui/PasswordStrength.tsx
 * @description Átomo visual de entropía. Analiza la fortaleza de la contraseña
 *              y proyecta indicadores en espacio OKLCH.
 * @version 1.0 - Adaptive Visual Entropy
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useMemo } from 'react';
import { cn } from '../utils/cn';

interface PasswordStrengthProps {
  password?: string;
  label: string;
  className?: string;
}

/**
 * APARATO: PasswordStrength
 */
export function PasswordStrength({ password = '', label, className }: PasswordStrengthProps) {
  /**
   * MOTOR DE CÁLCULO DE ENTROPÍA (Pure Logic)
   * 0: Vacío, 1: Débil, 2: Media, 3: Fuerte
   */
  const strength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthConfig = [
    { color: 'bg-zinc-700/50', label: '---' }, // Nivel 0
    { color: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]', label: 'WEAK' },
    { color: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]', label: 'MEDIUM' },
    { color: 'bg-success shadow-[0_0_10px_var(--color-success)]', label: 'STRONG' }
  ];

  const current = strengthConfig[strength];

  return (
    <div className={cn("space-y-2 px-1", className)}>
      <div className="flex gap-1.5 h-1.5 w-full">
        {[1, 2, 3].map((level) => (
          <div 
            key={level} 
            className={cn(
              "h-full w-1/3 rounded-full transition-all duration-700 ease-out",
              strength >= level ? current.color : "bg-foreground/10"
            )} 
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {password && (
           <span className={cn(
             "text-[8px] font-mono font-bold uppercase tracking-widest transition-colors",
             strength === 1 ? "text-red-500" : strength === 2 ? "text-yellow-500" : "text-success"
           )}>
             {current.label}
           </span>
        )}
      </div>
    </div>
  );
}