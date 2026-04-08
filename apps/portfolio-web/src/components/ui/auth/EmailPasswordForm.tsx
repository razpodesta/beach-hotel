/**
 * @file EmailPasswordForm.tsx
 * @description Aparato de Autenticación con Fortaleza (Entropy-Aware).
 *              Refactorizado: Erradicación de assertions no nulas, tipado estricto
 *              y blindaje contra variables de entorno inexistentes.
 * @version 2.2 - Identity Fortress Standard
 * @author Raz Podestá -  MetaShark Tech
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils/cn';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

export interface AuthCredentials {
  password?: string;
  email?: string;
}

export interface LoginPayload extends AuthCredentials {
  recaptchaToken: string;
}

interface EmailPasswordFormProps {
  dictionary: Dictionary['auth_portal'];
  onLoginStart: (data: LoginPayload) => Promise<void>;
}

declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const EmailPasswordForm = ({ dictionary, onLoginStart }: EmailPasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['bg-zinc-700', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

  // Inyección de script ReCaptcha con seguridad de entorno
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
        console.error('[HEIMDALL][AUTH] ReCaptcha SITE_KEY missing.');
        return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    // Blindaje contra llaves inexistentes (Erradicación de non-null assertion)
    if (!siteKey) {
        console.error('[HEIMDALL][AUTH] Cannot execute ReCaptcha: SITE_KEY missing.');
        return;
    }

    setIsProcessing(true);
    try {
        const token = await window.grecaptcha.execute(siteKey, { action: 'login' });
        await onLoginStart({ email, password, recaptchaToken: token });
    } catch (err) {
        console.error('[HEIMDALL][AUTH] Security Gate Failure', err);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dictionary.email_placeholder} 
        className="w-full bg-background/40 border border-border/50 rounded-xl py-4 px-6 text-sm outline-none focus:border-primary/40 transition-all text-foreground" 
      />
      
      <div className="relative">
        <input 
          type={showPassword ? 'text' : 'password'} 
          placeholder={dictionary.password_placeholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-background/40 border border-border/50 rounded-xl py-4 px-6 text-sm outline-none focus:border-primary/40 transition-all text-foreground"
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)} 
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label={dictionary.label_toggle_password}
        >
          {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>

      <div className="space-y-1 px-1">
        <div className="flex gap-1 h-1.5 w-full">
           {[1,2,3].map((i) => (
             <div key={i} className={cn("h-full w-1/3 rounded-full transition-colors duration-500", strength >= i ? strengthColors[strength] : "bg-border")} />
           ))}
        </div>
        <p className="text-[9px] font-mono uppercase text-muted-foreground">{dictionary.label_password_strength}</p>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 text-[10px] text-zinc-400 cursor-pointer hover:text-foreground transition-colors">
          <input type="checkbox" className="accent-primary" required /> {dictionary.label_tos}
        </label>
        <label className="flex items-center gap-3 text-[10px] text-zinc-400 cursor-pointer hover:text-foreground transition-colors">
          <input type="checkbox" className="accent-primary" /> {dictionary.label_newsletter}
        </label>
      </div>

      <button 
        type="submit" 
        disabled={isProcessing}
        className="w-full py-5 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isProcessing ? <Loader2 className="animate-spin" size={16} /> : dictionary.email_cta}
      </button>
    </form>
  );
};