/**
 * @file packages/identity-gateway/src/ui/forms/RegisterForm.tsx
 * @description Orquestador de Registro Soberano. 
 *              Valida la creación de nuevas identidades con rigor criptográfico
 *              y captura de consentimiento legal (KYC/KYB base).
 *              Refactorizado: Sincronización con el estándar de promesas seguras
 *              y telemetría de resiliencia (Optional Catch Binding).
 * @version 1.2 - Promise-Safe & Linter Pure
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

import { cn } from '../../utils/cn';
import { 
  registerCredentialsSchema, 
  type RegisterCredentials, 
  type IdentityDictionary 
} from '../../schemas/auth.schema';
import { PasswordStrength } from '../PasswordStrength';

interface RegisterFormProps {
  dictionary: IdentityDictionary;
  onSubmit: (data: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
}

/**
 * APARATO: RegisterForm
 */
export function RegisterForm({ dictionary, onSubmit, isLoading = false }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerCredentialsSchema),
    defaultValues: { newsletterOptIn: true, recaptchaToken: 'PENDING_FROM_GATEWAY' }
  });

  const passwordValue = watch('password');

  /**
   * @function handleFormSubmit
   * @description Blinda la ejecución asíncrona de la creación de identidad.
   * @pilar IV: Observabilidad y Resiliencia.
   */
  const handleFormSubmit = useCallback(async (data: RegisterCredentials) => {
    try {
      await onSubmit(data);
    } catch {
      console.warn('[HEIMDALL][AUTH-FORM] Registration handshake interrupted.');
    }
  }, [onSubmit]);

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className="space-y-5 animate-in fade-in duration-700"
    >
      
      {/* 1. IDENTITY NAME */}
      <div className="space-y-1.5">
        <div className="group relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" size={18} />
          <input 
            {...register('name')}
            placeholder={dictionary.name_placeholder}
            disabled={isLoading}
            className={cn(
              "w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none transition-all",
              "focus:border-primary/40 focus:bg-background text-foreground",
              errors.name && "border-red-500/50 bg-red-500/5"
            )} 
          />
        </div>
        {errors.name && <p className="text-[9px] font-mono text-red-500 ml-4 uppercase">{errors.name.message}</p>}
      </div>

      {/* 2. IDENTITY EMAIL */}
      <div className="space-y-1.5">
        <div className="group relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" size={18} />
          <input 
            {...register('email')}
            type="email" 
            placeholder={dictionary.email_placeholder} 
            disabled={isLoading}
            className={cn(
              "w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none transition-all",
              "focus:border-primary/40 focus:bg-background text-foreground",
              errors.email && "border-red-500/50 bg-red-500/5"
            )} 
          />
        </div>
        {errors.email && <p className="text-[9px] font-mono text-red-500 ml-4 uppercase">{errors.email.message}</p>}
      </div>

      {/* 3. ACCESS KEYS (Password + Confirmation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="group relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary" size={18} />
            <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'} 
              placeholder={dictionary.password_placeholder}
              disabled={isLoading}
              className={cn(
                "w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-12 pr-10 text-sm outline-none transition-all focus:border-primary/40 focus:bg-background",
                errors.password && "border-red-500/50"
              )}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="group relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
            <input 
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'} 
              placeholder={dictionary.confirm_password_placeholder}
              disabled={isLoading}
              className={cn(
                "w-full bg-background/40 border border-border/50 rounded-2xl py-4 pl-12 pr-10 text-sm outline-none transition-all focus:border-primary/40 focus:bg-background",
                errors.confirmPassword && "border-red-500/50"
              )}
            />
             <button 
               type="button" 
               onClick={() => setShowPassword(!showPassword)} 
               disabled={isLoading}
               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
             >
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
             </button>
          </div>
        </div>
      </div>

      {/* ENTROPY ANALYZER */}
      <PasswordStrength password={passwordValue} label={dictionary.label_password_strength} />
      {(errors.password || errors.confirmPassword) && (
        <p className="text-[9px] font-mono text-red-500 ml-4 uppercase">
          {errors.password?.message || errors.confirmPassword?.message}
        </p>
      )}

      {/* 4. CONSENTS & COMPLIANCE */}
      <div className="space-y-3 pt-2">
        <label className="group flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5">
            <input {...register('tosConsent')} disabled={isLoading} type="checkbox" className="peer sr-only" />
            <div className="h-5 w-5 rounded-lg border border-border bg-background/40 transition-all peer-checked:bg-primary peer-checked:border-primary" />
            <CheckCircle2 size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <span className="text-[10px] text-muted-foreground leading-tight group-hover:text-foreground transition-colors">
            {dictionary.label_tos}
          </span>
        </label>

        <label className="group flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5">
            <input {...register('newsletterOptIn')} disabled={isLoading} type="checkbox" className="peer sr-only" />
            <div className="h-5 w-5 rounded-lg border border-border bg-background/40 transition-all peer-checked:bg-primary peer-checked:border-primary" />
            <CheckCircle2 size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <span className="text-[10px] text-muted-foreground leading-tight group-hover:text-foreground transition-colors">
            {dictionary.label_newsletter}
          </span>
        </label>
      </div>

      {/* 5. DISPATCH (Action Button) */}
      <button 
        type="submit" 
        disabled={isLoading}
        className={cn(
          "w-full py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.4em] shadow-3xl transition-all active:scale-[0.98] flex items-center justify-center gap-3",
          isLoading ? "bg-surface text-muted-foreground cursor-wait" : "bg-foreground text-background hover:bg-primary hover:text-white shadow-primary/10"
        )}
      >
        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={18} />}
        {isLoading ? dictionary.label_processing : dictionary.register_cta}
      </button>
    </form>
  );
}