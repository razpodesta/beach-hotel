/**
 * @file packages/identity-gateway/src/ui/forms/LoginForm.tsx
 * @description Aparato de Autenticación con Fortaleza. 
 *              Refactorizado: Erradicación de extensiones .js para 
 *              compatibilidad absoluta con el motor de resolución "bundler"
 *              (Next.js 15 / Vercel Build Sync).
 *              Cumplimiento: Pilar X (Higiene de Código) e Integridad de Tipos.
 * @version 3.3 - Bundler Resolution Standard
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

import { cn } from '../../utils/cn';
import { 
  loginCredentialsSchema, 
  type LoginCredentials, 
  type IdentityDictionary 
} from '../../schemas/auth.schema';
import { PasswordStrength } from '../PasswordStrength';

interface LoginFormProps {
  dictionary: IdentityDictionary;
  /** Función de despacho que debe ser esperada para evitar promesas flotantes */
  onSubmit: (data: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
}

/**
 * APARATO: LoginForm
 * @description Formulario controlado, desacoplado de la infraestructura de red.
 */
export function LoginForm({ dictionary, onSubmit, isLoading = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
    defaultValues: { 
      email: '', 
      password: '', 
      recaptchaToken: 'PENDING_FROM_GATEWAY' 
    }
  });

  const passwordValue = watch('password');

  /**
   * @function handleFormSubmit
   * @description El LoginForm no ejecuta el login directamente,
   * despacha los datos validados al orquestador (AuthModal).
   * @fix: Se utiliza Optional Catch Binding para satisfacer a ESLint.
   */
  const handleFormSubmit = useCallback(async (data: LoginCredentials) => {
    try {
      await onSubmit(data);
    } catch {
      /**
       * @pilar IV: Observabilidad.
       * El error es gestionado por el modal padre, aquí solo cerramos 
       * el ciclo de vida de la promesa de forma segura.
       */
      console.warn('[HEIMDALL][AUTH-FORM] Handshake connection severed.');
    }
  }, [onSubmit]);

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className="space-y-6 animate-in fade-in duration-700"
    >
      
      {/* 1. CAMPO: IDENTITY EMAIL */}
      <div className="space-y-2">
        <div className="group relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" size={18} />
          <input 
            {...register('email')}
            type="email" 
            placeholder={dictionary.email_placeholder} 
            disabled={isLoading}
            className={cn(
              "w-full bg-background/40 border border-border/50 rounded-2xl py-4.5 pl-12 pr-6 text-sm outline-none transition-all",
              "focus:border-primary/40 focus:bg-background text-foreground",
              errors.email && "border-red-500/50 bg-red-500/5"
            )} 
          />
        </div>
        {errors.email && (
          <p className="text-[10px] font-mono text-red-500 ml-4 uppercase tracking-widest animate-in slide-in-from-left-2">
            {errors.email.message}
          </p>
        )}
      </div>
      
      {/* 2. CAMPO: ACCESS KEY */}
      <div className="space-y-4">
        <div className="group relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" size={18} />
          <input 
            {...register('password')}
            type={showPassword ? 'text' : 'password'} 
            placeholder={dictionary.password_placeholder}
            disabled={isLoading}
            className={cn(
              "w-full bg-background/40 border border-border/50 rounded-2xl py-4.5 pl-12 pr-12 text-sm outline-none transition-all",
              "focus:border-primary/40 focus:bg-background text-foreground",
              errors.password && "border-red-500/50 bg-red-500/5"
            )}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors p-1"
            aria-label={dictionary.label_toggle_password}
          >
            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>

        {/* Átomo de Entropía Integrado */}
        <PasswordStrength 
          password={passwordValue} 
          label={dictionary.label_password_strength} 
        />
      </div>

      {/* 3. DISPATCHER (Action Button) */}
      <button 
        type="submit" 
        disabled={isLoading}
        className={cn(
          "w-full py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] transform-gpu flex items-center justify-center gap-3",
          isLoading 
            ? "bg-surface text-muted-foreground cursor-wait" 
            : "bg-foreground text-background hover:bg-primary hover:text-white"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>{dictionary.label_processing}</span>
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            <span>{dictionary.login_cta}</span>
          </>
        )}
      </button>

      {/* FOOTER: LEGAL COMPLIANCE */}
      <div className="pt-4 border-t border-border/40 opacity-40">
        <p className="text-[8px] font-mono text-center uppercase tracking-widest leading-relaxed">
          {dictionary.privacy_notice}
        </p>
      </div>
    </form>
  );
}