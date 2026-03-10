// RUTA: apps/portfolio-web/src/components/ui/LanguageSwitcher.tsx

/**
 * @file Selector de Idioma (LanguageSwitcher)
 * @version 6.0 - Semantic Interaction
 * @description Selector de idioma optimizado para Accesibilidad (WCAG 2.2).
 *              Utiliza DropdownMenu para la gestión de estados y navegación.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { cn } from '../../lib/utils/cn';
import { i18n, type Locale } from '../../config/i18n.config';
import type { Dictionary } from '../../lib/schemas/dictionary.schema';
import { DropdownMenu } from './DropdownMenu';
import { Flag } from './Flag';

interface LanguageSwitcherProps {
  dictionary: Dictionary['language_switcher'];
  className?: string;
}

const COUNTRY_MAP: Record<Locale, string> = {
  'en-US': 'US',
  'es-ES': 'ES',
  'pt-BR': 'BR',
};

export function LanguageSwitcher({ dictionary, className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const currentLocale = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    setCookie(i18n.cookieName, newLocale, { 
      maxAge: 31536000, 
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <DropdownMenu
      className={className}
      trigger={
        <button
          className={cn(
            "flex items-center justify-center p-2 rounded-full transition-all duration-300",
            "bg-muted/50 border border-border hover:bg-accent focus:ring-2 focus:ring-primary focus:outline-none"
          )}
          aria-label={dictionary.label}
        >
          <Flag countryCode={COUNTRY_MAP[currentLocale] || 'BR'} className="h-5 w-5" />
        </button>
      }
    >
      <div className="flex flex-col p-1 w-48" role="menu">
        {i18n.locales.map((locale) => {
          const isSelected = currentLocale === locale;
          return (
            <button
              key={locale}
              role="menuitem"
              aria-selected={isSelected}
              onClick={() => handleLanguageChange(locale)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Flag countryCode={COUNTRY_MAP[locale] || 'BR'} className="h-4 w-4" />
              <span className="flex-1 text-left">{dictionary[locale]}</span>
              {isSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </DropdownMenu>
  );
}